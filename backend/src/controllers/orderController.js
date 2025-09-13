const { Order, OrderItem, Customer, Product, ProductVariant, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const orderController = {
  // Get all orders with filtering and pagination
  getOrders: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        payment_status,
        fulfillment_status,
        customer_id,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Search filter
      if (search) {
        where[Op.or] = [
          { order_number: { [Op.iLike]: `%${search}%` } },
          { '$customer.first_name$': { [Op.iLike]: `%${search}%` } },
          { '$customer.last_name$': { [Op.iLike]: `%${search}%` } },
          { '$customer.email$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Status filters
      if (status) where.status = status;
      if (payment_status) where.payment_status = payment_status;
      if (fulfillment_status) where.fulfillment_status = fulfillment_status;
      if (customer_id) where.customer_id = customer_id;

      // Date range filter
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'product_name', 'quantity', 'price', 'total'],
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug']
              }
            ]
          }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get single order
  getOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug']
              },
              {
                model: ProductVariant,
                as: 'variant',
                attributes: ['id', 'title', 'sku']
              }
            ]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      res.json({
        success: true,
        data: { order }
      });

    } catch (error) {
      logger.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, tracking_number, shipping_method } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      const oldValues = order.toJSON();
      
      // Prepare update data
      const updateData = { status };
      if (tracking_number) updateData.tracking_number = tracking_number;
      if (shipping_method) updateData.shipping_method = shipping_method;

      await order.updateStatus(status, notes);
      
      if (tracking_number || shipping_method) {
        await order.update({ tracking_number, shipping_method });
      }

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update_status',
        resourceType: 'order',
        resourceId: order.id,
        oldValues,
        newValues: { status, notes, tracking_number, shipping_method },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emit real-time update
      req.app.get('io').emit('order-status-updated', {
        order_id: order.id,
        status,
        tracking_number
      });

      // Fetch updated order
      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          { model: Customer, as: 'customer' },
          { model: OrderItem, as: 'items' }
        ]
      });

      res.json({
        success: true,
        message: 'Order status updated successfully.',
        data: { order: updatedOrder }
      });

    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_status, payment_reference } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      const oldValues = order.toJSON();
      const updateData = { payment_status };
      if (payment_reference) updateData.payment_reference = payment_reference;

      await order.update(updateData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update_payment_status',
        resourceType: 'order',
        resourceId: order.id,
        oldValues,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emit real-time update
      req.app.get('io').emit('order-payment-updated', {
        order_id: order.id,
        payment_status,
        payment_reference
      });

      res.json({
        success: true,
        message: 'Payment status updated successfully.',
        data: { order }
      });

    } catch (error) {
      logger.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Add order notes
  addOrderNotes: async (req, res) => {
    try {
      const { id } = req.params;
      const { notes, is_internal = true } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] ${req.user.getFullName()}: ${notes}`;
      
      const field = is_internal ? 'internal_notes' : 'notes';
      const currentNotes = order[field] || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n\n${noteEntry}` : noteEntry;

      await order.update({ [field]: updatedNotes });

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'add_notes',
        resourceType: 'order',
        resourceId: order.id,
        newValues: { notes, is_internal },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Notes added successfully.',
        data: { order }
      });

    } catch (error) {
      logger.error('Add order notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get order statistics
  getOrderStatistics: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      const where = {};
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      // Total orders and revenue
      const totalStats = await Order.findOne({
        where,
        attributes: [
          [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'total_orders'],
          [Order.sequelize.fn('SUM', Order.sequelize.col('total_amount')), 'total_revenue'],
          [Order.sequelize.fn('AVG', Order.sequelize.col('total_amount')), 'average_order_value']
        ],
        raw: true
      });

      // Status breakdown
      const statusBreakdown = await Order.findAll({
        where,
        attributes: [
          'status',
          [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Payment status breakdown
      const paymentBreakdown = await Order.findAll({
        where,
        attributes: [
          'payment_status',
          [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
        ],
        group: ['payment_status'],
        raw: true
      });

      // Recent orders
      const recentOrders = await Order.findAll({
        where,
        include: [
          { model: Customer, as: 'customer', attributes: ['first_name', 'last_name'] }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          total_stats: totalStats,
          status_breakdown: statusBreakdown,
          payment_breakdown: paymentBreakdown,
          recent_orders: recentOrders
        }
      });

    } catch (error) {
      logger.error('Get order statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Bulk order operations
  bulkOrderOperations: async (req, res) => {
    try {
      const { action, order_ids, data } = req.body;

      if (!action || !order_ids || !Array.isArray(order_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Action and order_ids array are required.'
        });
      }

      let result;

      switch (action) {
        case 'update_status':
          if (!data.status) {
            return res.status(400).json({
              success: false,
              message: 'Status is required for status update.'
            });
          }
          result = await Order.update(
            { status: data.status },
            { where: { id: order_ids } }
          );
          break;

        case 'update_fulfillment':
          if (!data.fulfillment_status) {
            return res.status(400).json({
              success: false,
              message: 'Fulfillment status is required.'
            });
          }
          result = await Order.update(
            { fulfillment_status: data.fulfillment_status },
            { where: { id: order_ids } }
          );
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action.'
          });
      }

      // Log bulk operation
      await AuditLog.logAction({
        userId: req.user.id,
        action: `bulk_${action}`,
        resourceType: 'order',
        resourceId: order_ids.join(','),
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emit real-time update
      req.app.get('io').emit('orders-bulk-updated', { action, order_ids, data });

      res.json({
        success: true,
        message: `Bulk ${action} completed successfully.`,
        data: { affected_count: result[0] }
      });

    } catch (error) {
      logger.error('Bulk order operations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = orderController;