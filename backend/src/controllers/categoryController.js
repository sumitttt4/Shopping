const { Category, Product, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const categoryController = {
  // Get all categories with hierarchy
  getCategories: async (req, res) => {
    try {
      const { include_children = 'true', status, search } = req.query;

      const where = {};
      
      if (status) {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      let categories;

      if (include_children === 'true') {
        // Get hierarchical structure
        categories = await Category.findAll({
          where: { ...where, parent_id: null },
          include: [{
            model: Category,
            as: 'children',
            include: [{
              model: Category,
              as: 'children',
              order: [['sort_order', 'ASC'], ['name', 'ASC']]
            }],
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
          }],
          order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
      } else {
        // Get flat list
        categories = await Category.findAll({
          where,
          include: [{
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'slug']
          }],
          order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
      }

      res.json({
        success: true,
        data: { categories }
      });

    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get single category
  getCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { include_products = 'false' } = req.query;

      const include = [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'sort_order', 'product_count']
        }
      ];

      if (include_products === 'true') {
        include.push({
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'slug', 'price', 'status', 'featured'],
          limit: 20,
          order: [['created_at', 'DESC']]
        });
      }

      const category = await Category.findByPk(id, { include });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      res.json({
        success: true,
        data: { category }
      });

    } catch (error) {
      logger.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const categoryData = req.body;

      const category = await Category.create(categoryData);

      // Update parent's product count if applicable
      if (category.parent_id) {
        await Category.increment('product_count', {
          where: { id: category.parent_id }
        });
      }

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'create',
        resourceType: 'category',
        resourceId: category.id,
        newValues: categoryData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Fetch created category with associations
      const createdCategory = await Category.findByPk(category.id, {
        include: [
          { model: Category, as: 'parent', attributes: ['id', 'name'] },
          { model: Category, as: 'children', attributes: ['id', 'name'] }
        ]
      });

      // Emit real-time update
      req.app.get('io').emit('category-created', createdCategory);

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: { category: createdCategory }
      });

    } catch (error) {
      logger.error('Create category error:', error);
      
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
          message: 'Category slug already exists.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      // Check for circular reference if updating parent_id
      if (updateData.parent_id && updateData.parent_id !== category.parent_id) {
        if (updateData.parent_id === category.id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent.'
          });
        }

        // Check if new parent is a descendant
        const checkCircular = async (parentId, targetId) => {
          const parent = await Category.findByPk(parentId);
          if (!parent) return false;
          if (parent.parent_id === targetId) return true;
          if (parent.parent_id) return await checkCircular(parent.parent_id, targetId);
          return false;
        };

        if (await checkCircular(updateData.parent_id, category.id)) {
          return res.status(400).json({
            success: false,
            message: 'Circular reference detected.'
          });
        }
      }

      const oldValues = category.toJSON();
      await category.update(updateData);

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update',
        resourceType: 'category',
        resourceId: category.id,
        oldValues,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Fetch updated category with associations
      const updatedCategory = await Category.findByPk(category.id, {
        include: [
          { model: Category, as: 'parent', attributes: ['id', 'name'] },
          { model: Category, as: 'children', attributes: ['id', 'name'] }
        ]
      });

      // Emit real-time update
      req.app.get('io').emit('category-updated', updatedCategory);

      res.json({
        success: true,
        message: 'Category updated successfully.',
        data: { category: updatedCategory }
      });

    } catch (error) {
      logger.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { move_products_to } = req.query;

      const category = await Category.findByPk(id, {
        include: [
          { model: Category, as: 'children' },
          { model: Product, as: 'products' }
        ]
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      // Check if category has children
      if (category.children && category.children.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with subcategories. Please delete or move subcategories first.'
        });
      }

      // Handle products in this category
      if (category.products && category.products.length > 0) {
        if (move_products_to) {
          // Move products to another category
          await Product.update(
            { category_id: move_products_to },
            { where: { category_id: id } }
          );
        } else {
          return res.status(400).json({
            success: false,
            message: 'Category has products. Please specify move_products_to parameter or move products manually.'
          });
        }
      }

      // Log audit before deletion
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'delete',
        resourceType: 'category',
        resourceId: category.id,
        oldValues: category.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await category.destroy();

      // Emit real-time update
      req.app.get('io').emit('category-deleted', { id });

      res.json({
        success: true,
        message: 'Category deleted successfully.'
      });

    } catch (error) {
      logger.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Update category sort order
  updateSortOrder: async (req, res) => {
    try {
      const { categories } = req.body;

      if (!Array.isArray(categories)) {
        return res.status(400).json({
          success: false,
          message: 'Categories array is required.'
        });
      }

      // Update sort orders
      for (const cat of categories) {
        await Category.update(
          { sort_order: cat.sort_order },
          { where: { id: cat.id } }
        );
      }

      // Log audit
      await AuditLog.logAction({
        userId: req.user.id,
        action: 'update_sort_order',
        resourceType: 'category',
        resourceId: categories.map(c => c.id).join(','),
        newValues: { categories },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emit real-time update
      req.app.get('io').emit('categories-reordered', { categories });

      res.json({
        success: true,
        message: 'Category sort order updated successfully.'
      });

    } catch (error) {
      logger.error('Update sort order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // Get category analytics
  getCategoryAnalytics: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      // Get product statistics
      const productStats = await Product.findAll({
        where: { category_id: id },
        attributes: [
          [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'total_products'],
          [Category.sequelize.fn('SUM', Category.sequelize.col('stock_quantity')), 'total_stock'],
          [Category.sequelize.fn('AVG', Category.sequelize.col('price')), 'average_price'],
          [Category.sequelize.fn('SUM', Category.sequelize.col('sales_count')), 'total_sales']
        ],
        raw: true
      });

      // Get status breakdown
      const statusBreakdown = await Product.findAll({
        where: { category_id: id },
        attributes: [
          'status',
          [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          category,
          statistics: productStats[0],
          status_breakdown: statusBreakdown
        }
      });

    } catch (error) {
      logger.error('Get category analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = categoryController;