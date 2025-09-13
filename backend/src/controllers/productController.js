const { Product, Category, ProductVariant, ProductImage, User, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const productController = {
  // Get all products with filtering, pagination, and search
  getProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category_id,
        status,
        featured,
        sort_by = 'created_at',
        sort_order = 'DESC',
        min_price,
        max_price,
        in_stock,
        low_stock
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const include = [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'alt_text', 'is_primary'],
          limit: 1,
          where: { is_primary: true },
          required: false
        },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'sku', 'title', 'price', 'stock_quantity']
        }
      ];

      // Search filter
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search] } }
        ];
      }

      // Category filter
      if (category_id) {
        where.category_id = category_id;
      }

      // Status filter
      if (status) {
        where.status = status;
      }

      // Featured filter
      if (featured !== undefined) {
        where.featured = featured === 'true';
      }

      // Price range filter
      if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price[Op.gte] = min_price;
        if (max_price) where.price[Op.lte] = max_price;
      }

      // Stock filters
      if (in_stock === 'true') {
        where[Op.or] = [
          { track_quantity: false },
          { stock_quantity: { [Op.gt]: 0 } }
        ];
      }

      if (low_stock === 'true') {
        where.track_quantity = true;
        where[Op.and] = [
          { stock_quantity: { [Op.lte]: { [Op.col]: 'low_stock_threshold' } } }
        ];
      }

      // Sorting
      const orderBy = [[sort_by, sort_order.toUpperCase()]];

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include,
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get single product
  getProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'url', 'alt_text', 'sort_order', 'is_primary'],
            order: [['sort_order', 'ASC']]
          },
          {
            model: ProductVariant,
            as: 'variants',
            attributes: ['id', 'sku', 'title', 'price', 'compare_price', 'stock_quantity', 'attributes'],
            order: [['sort_order', 'ASC']]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      // Increment view count
      await product.incrementViews();

      res.json({
        success: true,
        data: { product }
      });

    } catch (error) {
      logger.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const productData = {
        ...req.body,
        created_by: req.user.id
      };

      const product = await Product.create(productData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'create',
        resourceType: 'product',
        resourceId: product.id,
        newValues: productData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Fetch created product with associations
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images' },
          { model: ProductVariant, as: 'variants' }
        ]
      });

      // Emit real-time update
      req.app.get('io').emit('product-created', createdProduct);

      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: { product: createdProduct }
      });

    } catch (error) {
      logger.error('Create product error:', error);
      
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

      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const oldValues = product.toJSON();
      await product.update(updateData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update',
        resourceType: 'product',
        resourceId: product.id,
        oldValues,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Fetch updated product with associations
      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images' },
          { model: ProductVariant, as: 'variants' }
        ]
      });

      // Emit real-time update
      req.app.get('io').emit('product-updated', updatedProduct);

      res.json({
        success: true,
        message: 'Product updated successfully.',
        data: { product: updatedProduct }
      });

    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      // Log audit before deletion
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'delete',
        resourceType: 'product',
        resourceId: product.id,
        oldValues: product.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await product.destroy();

      // Emit real-time update
      req.app.get('io').emit('product-deleted', { id });

      res.json({
        success: true,
        message: 'Product deleted successfully.'
      });

    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Bulk operations
  bulkOperations: async (req, res) => {
    try {
      const { action, product_ids, data } = req.body;

      if (!action || !product_ids || !Array.isArray(product_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Action and product_ids array are required.'
        });
      }

      let result;
      
      switch (action) {
        case 'delete':
          result = await Product.destroy({
            where: { id: product_ids }
          });
          // Emit real-time update
          req.app.get('io').emit('products-bulk-deleted', { product_ids });
          break;

        case 'update_status':
          if (!data.status) {
            return res.status(400).json({
              success: false,
              message: 'Status is required for status update.'
            });
          }
          result = await Product.update(
            { status: data.status },
            { where: { id: product_ids } }
          );
          break;

        case 'update_category':
          if (!data.category_id) {
            return res.status(400).json({
              success: false,
              message: 'Category ID is required for category update.'
            });
          }
          result = await Product.update(
            { category_id: data.category_id },
            { where: { id: product_ids } }
          );
          break;

        case 'toggle_featured':
          result = await Product.update(
            { featured: data.featured },
            { where: { id: product_ids } }
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
        resourceType: 'product',
        resourceId: product_ids.join(','),
        newValues: data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `Bulk ${action} completed successfully.`,
        data: { affected_count: result[0] || result }
      });

    } catch (error) {
      logger.error('Bulk operations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get low stock products
  getLowStockProducts: async (req, res) => {
    try {
      const { limit = 50 } = req.query;

      const products = await Product.findAll({
        where: {
          track_quantity: true,
          [Op.and]: [
            { stock_quantity: { [Op.lte]: { [Op.col]: 'low_stock_threshold' } } }
          ]
        },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] }
        ],
        order: [['stock_quantity', 'ASC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: { products }
      });

    } catch (error) {
      logger.error('Get low stock products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = productController;