const { Customer, Order, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const customerController = {
  // Get all customers with filtering and pagination
  getCustomers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customer_group,
        status,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Search filter
      if (search) {
        where[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filters
      if (customer_group) where.customer_group = customer_group;
      if (status) where.status = status;

      const { count, rows: customers } = await Customer.findAndCountAll({
        where,
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: { exclude: ['addresses'] } // Exclude large JSON field from list
      });

      res.json({
        success: true,
        data: {
          customers,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get single customer
  getCustomer: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await Customer.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'orders',
            attributes: ['id', 'order_number', 'status', 'total_amount', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
          }
        ]
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found.'
        });
      }

      res.json({
        success: true,
        data: { customer }
      });

    } catch (error) {
      logger.error('Get customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Create customer
  createCustomer: async (req, res) => {
    try {
      const customerData = req.body;

      const customer = await Customer.create(customerData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'create',
        resourceType: 'customer',
        resourceId: customer.id,
        newValues: customerData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully.',
        data: { customer }
      });

    } catch (error) {
      logger.error('Create customer error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update customer
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found.'
        });
      }

      const oldValues = customer.toJSON();
      await customer.update(updateData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update',
        resourceType: 'customer',
        resourceId: customer.id,
        oldValues,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Customer updated successfully.',
        data: { customer }
      });

    } catch (error) {
      logger.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Delete customer
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found.'
        });
      }

      // Check if customer has orders
      const orderCount = await Order.count({ where: { customer_id: id } });
      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer with existing orders.'
        });
      }

      // Log audit before deletion
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'delete',
        resourceType: 'customer',
        resourceId: customer.id,
        oldValues: customer.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await customer.destroy();

      res.json({
        success: true,
        message: 'Customer deleted successfully.'
      });

    } catch (error) {
      logger.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get customer statistics
  getCustomerStatistics: async (req, res) => {
    try {
      // Total customers
      const totalCustomers = await Customer.count();

      // Customer group breakdown
      const groupBreakdown = await Customer.findAll({
        attributes: [
          'customer_group',
          [Customer.sequelize.fn('COUNT', Customer.sequelize.col('id')), 'count']
        ],
        group: ['customer_group'],
        raw: true
      });

      // Status breakdown
      const statusBreakdown = await Customer.findAll({
        attributes: [
          'status',
          [Customer.sequelize.fn('COUNT', Customer.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Top customers by spending
      const topCustomers = await Customer.findAll({
        order: [['total_spent', 'DESC']],
        limit: 10,
        attributes: ['id', 'first_name', 'last_name', 'email', 'total_spent', 'total_orders']
      });

      // Recent customers
      const recentCustomers = await Customer.findAll({
        order: [['created_at', 'DESC']],
        limit: 10,
        attributes: ['id', 'first_name', 'last_name', 'email', 'created_at']
      });

      res.json({
        success: true,
        data: {
          total_customers: totalCustomers,
          group_breakdown: groupBreakdown,
          status_breakdown: statusBreakdown,
          top_customers: topCustomers,
          recent_customers: recentCustomers
        }
      });

    } catch (error) {
      logger.error('Get customer statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Add customer note
  addCustomerNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found.'
        });
      }

      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] ${req.user.getFullName()}: ${note}`;
      const currentNotes = customer.notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n\n${noteEntry}` : noteEntry;

      await customer.update({ notes: updatedNotes });

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'add_note',
        resourceType: 'customer',
        resourceId: customer.id,
        newValues: { note },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Note added successfully.',
        data: { customer }
      });

    } catch (error) {
      logger.error('Add customer note error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = customerController;