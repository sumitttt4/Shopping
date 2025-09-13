const { Product, Category, Order, Customer, OrderItem, ProductVariant, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AnalyticsController {
  // Dashboard overview
  async getDashboardData(req, res) {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Total counts
      const [
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        totalRevenue,
        todayOrders,
        todayRevenue,
        monthlyRevenue,
        lowStockProducts,
        pendingOrders
      ] = await Promise.all([
        Product.count({ where: { deleted_at: null } }),
        Category.count({ where: { deleted_at: null } }),
        Customer.count(),
        Order.count(),
        Order.sum('total_amount'),
        Order.count({
          where: {
            created_at: { [Op.gte]: startOfToday }
          }
        }),
        Order.sum('total_amount', {
          where: {
            created_at: { [Op.gte]: startOfToday }
          }
        }),
        Order.sum('total_amount', {
          where: {
            created_at: { [Op.gte]: startOfMonth }
          }
        }),
        Product.count({
          where: {
            stock_quantity: { [Op.lte]: 10 },
            deleted_at: null
          }
        }),
        Order.count({
          where: {
            status: 'pending'
          }
        })
      ]);

      // Recent orders
      const recentOrders = await Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Customer,
            attributes: ['first_name', 'last_name', 'email']
          }
        ]
      });

      // Top selling products (last 30 days)
      const topProducts = await OrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
          [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'total_revenue']
        ],
        include: [
          {
            model: Product,
            attributes: ['name', 'sku'],
            where: { deleted_at: null }
          },
          {
            model: Order,
            where: {
              created_at: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: []
          }
        ],
        group: ['product_id', 'Product.id', 'Product.name', 'Product.sku'],
        order: [[sequelize.literal('total_sold'), 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalProducts,
            totalCategories,
            totalCustomers,
            totalOrders,
            totalRevenue: totalRevenue || 0,
            todayOrders,
            todayRevenue: todayRevenue || 0,
            monthlyRevenue: monthlyRevenue || 0,
            lowStockProducts,
            pendingOrders
          },
          recentOrders,
          topProducts
        }
      });

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Sales analytics
  async getSalesAnalytics(req, res) {
    try {
      const { period = '30', start_date, end_date } = req.query;
      
      let dateFilter = {};
      const now = new Date();
      
      if (start_date && end_date) {
        dateFilter = {
          created_at: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        };
      } else {
        const daysAgo = new Date(now.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000));
        dateFilter = {
          created_at: { [Op.gte]: daysAgo }
        };
      }

      // Daily sales data
      const dailySales = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_order_value']
        ],
        where: dateFilter,
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      });

      // Sales by status
      const salesByStatus = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        where: dateFilter,
        group: ['status']
      });

      // Sales by payment method
      const salesByPayment = await Order.findAll({
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        where: dateFilter,
        group: ['payment_method']
      });

      // Top customers by revenue
      const topCustomers = await Order.findAll({
        attributes: [
          'customer_id',
          [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent']
        ],
        include: [
          {
            model: Customer,
            attributes: ['first_name', 'last_name', 'email', 'customer_group']
          }
        ],
        where: dateFilter,
        group: ['customer_id', 'Customer.id', 'Customer.first_name', 'Customer.last_name', 'Customer.email', 'Customer.customer_group'],
        order: [[sequelize.literal('total_spent'), 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          dailySales,
          salesByStatus,
          salesByPayment,
          topCustomers
        }
      });

    } catch (error) {
      logger.error('Error fetching sales analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales analytics.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Product analytics
  async getProductAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = new Date(Date.now() - (parseInt(period) * 24 * 60 * 60 * 1000));

      // Best selling products
      const bestSellers = await OrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
          [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'order_frequency']
        ],
        include: [
          {
            model: Product,
            attributes: ['name', 'sku', 'stock_quantity'],
            where: { deleted_at: null }
          },
          {
            model: Order,
            where: {
              created_at: { [Op.gte]: daysAgo }
            },
            attributes: []
          }
        ],
        group: ['product_id', 'Product.id', 'Product.name', 'Product.sku', 'Product.stock_quantity'],
        order: [[sequelize.literal('total_sold'), 'DESC']],
        limit: 20
      });

      // Low stock products
      const lowStockProducts = await Product.findAll({
        where: {
          stock_quantity: { [Op.lte]: 10 },
          deleted_at: null
        },
        attributes: ['id', 'name', 'sku', 'stock_quantity', 'price'],
        order: [['stock_quantity', 'ASC']],
        limit: 20
      });

      // Products by category performance
      const categoryPerformance = await OrderItem.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
          [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'order_count']
        ],
        include: [
          {
            model: Product,
            attributes: ['category_id'],
            where: { deleted_at: null },
            include: [
              {
                model: Category,
                attributes: ['name'],
                where: { deleted_at: null }
              }
            ]
          },
          {
            model: Order,
            where: {
              created_at: { [Op.gte]: daysAgo }
            },
            attributes: []
          }
        ],
        group: ['Product.category_id', 'Product.Category.id', 'Product.Category.name'],
        order: [[sequelize.literal('revenue'), 'DESC']]
      });

      // Product variants performance
      const variantPerformance = await ProductVariant.findAll({
        attributes: [
          'id',
          'sku',
          'attributes',
          'stock_quantity',
          'price',
          [sequelize.literal('(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.variant_id = ProductVariant.id AND o.created_at >= ?)'), 'total_sold']
        ],
        include: [
          {
            model: Product,
            attributes: ['name'],
            where: { deleted_at: null }
          }
        ],
        order: [[sequelize.literal('total_sold'), 'DESC']],
        limit: 15,
        replacements: [daysAgo]
      });

      res.json({
        success: true,
        data: {
          bestSellers,
          lowStockProducts,
          categoryPerformance,
          variantPerformance
        }
      });

    } catch (error) {
      logger.error('Error fetching product analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product analytics.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Customer analytics
  async getCustomerAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = new Date(Date.now() - (parseInt(period) * 24 * 60 * 60 * 1000));

      // Customer acquisition
      const customerAcquisition = await Customer.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'new_customers']
        ],
        where: {
          created_at: { [Op.gte]: daysAgo }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      });

      // Customer by group
      const customerByGroup = await Customer.findAll({
        attributes: [
          'customer_group',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['customer_group']
      });

      // Customer lifetime value
      const customerLTV = await Customer.findAll({
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'customer_group',
          'created_at',
          [sequelize.literal('(SELECT COUNT(*) FROM orders WHERE customer_id = Customer.id)'), 'order_count'],
          [sequelize.literal('(SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = Customer.id)'), 'lifetime_value'],
          [sequelize.literal('(SELECT created_at FROM orders WHERE customer_id = Customer.id ORDER BY created_at DESC LIMIT 1)'), 'last_order_date']
        ],
        order: [[sequelize.literal('lifetime_value'), 'DESC']],
        limit: 20
      });

      // Customer retention analysis
      const retentionData = await sequelize.query(`
        WITH customer_cohorts AS (
          SELECT 
            customer_id,
            DATE_TRUNC('month', MIN(created_at)) as cohort_month,
            DATE_TRUNC('month', created_at) as order_month,
            ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) as order_number
          FROM orders 
          WHERE created_at >= :startDate
          GROUP BY customer_id, DATE_TRUNC('month', created_at)
        ),
        cohort_sizes AS (
          SELECT 
            cohort_month,
            COUNT(DISTINCT customer_id) as cohort_size
          FROM customer_cohorts
          WHERE order_number = 1
          GROUP BY cohort_month
        ),
        retention_table AS (
          SELECT 
            cc.cohort_month,
            cs.cohort_size,
            EXTRACT(MONTH FROM AGE(cc.order_month, cc.cohort_month)) as period_number,
            COUNT(DISTINCT cc.customer_id) as customers_returned
          FROM customer_cohorts cc
          JOIN cohort_sizes cs ON cc.cohort_month = cs.cohort_month
          GROUP BY cc.cohort_month, cs.cohort_size, period_number
        )
        SELECT 
          cohort_month,
          cohort_size,
          period_number,
          customers_returned,
          ROUND(100.0 * customers_returned / cohort_size, 2) as retention_rate
        FROM retention_table
        ORDER BY cohort_month, period_number
      `, {
        replacements: { startDate: daysAgo },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          customerAcquisition,
          customerByGroup,
          customerLTV,
          retentionData
        }
      });

    } catch (error) {
      logger.error('Error fetching customer analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer analytics.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Revenue analytics
  async getRevenueAnalytics(req, res) {
    try {
      const { period = '12', type = 'monthly' } = req.query;
      
      let dateFormat, dateInterval;
      switch (type) {
        case 'daily':
          dateFormat = 'YYYY-MM-DD';
          dateInterval = 'day';
          break;
        case 'weekly':
          dateFormat = 'YYYY-WW';
          dateInterval = 'week';
          break;
        case 'monthly':
          dateFormat = 'YYYY-MM';
          dateInterval = 'month';
          break;
        case 'yearly':
          dateFormat = 'YYYY';
          dateInterval = 'year';
          break;
        default:
          dateFormat = 'YYYY-MM';
          dateInterval = 'month';
      }

      const periodsAgo = new Date();
      if (dateInterval === 'day') {
        periodsAgo.setDate(periodsAgo.getDate() - parseInt(period));
      } else if (dateInterval === 'week') {
        periodsAgo.setDate(periodsAgo.getDate() - (parseInt(period) * 7));
      } else if (dateInterval === 'month') {
        periodsAgo.setMonth(periodsAgo.getMonth() - parseInt(period));
      } else if (dateInterval === 'year') {
        periodsAgo.setFullYear(periodsAgo.getFullYear() - parseInt(period));
      }

      // Revenue over time
      const revenueOverTime = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', dateInterval, sequelize.col('created_at')), 'period'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_order_value']
        ],
        where: {
          created_at: { [Op.gte]: periodsAgo }
        },
        group: [sequelize.fn('DATE_TRUNC', dateInterval, sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE_TRUNC', dateInterval, sequelize.col('created_at')), 'ASC']]
      });

      // Revenue by payment method
      const revenueByPayment = await Order.findAll({
        attributes: [
          'payment_method',
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_value']
        ],
        where: {
          created_at: { [Op.gte]: periodsAgo }
        },
        group: ['payment_method']
      });

      // Revenue comparison (current vs previous period)
      const currentPeriodRevenue = await Order.sum('total_amount', {
        where: {
          created_at: { [Op.gte]: periodsAgo }
        }
      });

      const previousPeriodStart = new Date(periodsAgo);
      const previousPeriodEnd = new Date(periodsAgo);
      if (dateInterval === 'day') {
        previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));
      } else if (dateInterval === 'week') {
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(period) * 7));
      } else if (dateInterval === 'month') {
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - parseInt(period));
      } else if (dateInterval === 'year') {
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - parseInt(period));
      }

      const previousPeriodRevenue = await Order.sum('total_amount', {
        where: {
          created_at: {
            [Op.between]: [previousPeriodStart, previousPeriodEnd]
          }
        }
      });

      const revenueGrowth = previousPeriodRevenue ? 
        ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 
        0;

      res.json({
        success: true,
        data: {
          revenueOverTime,
          revenueByPayment,
          summary: {
            currentPeriodRevenue: currentPeriodRevenue || 0,
            previousPeriodRevenue: previousPeriodRevenue || 0,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue analytics.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new AnalyticsController();