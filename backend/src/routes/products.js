const express = require('express');
const { body, validationResult, query } = require('express-validator');
const productController = require('../controllers/productController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array()
    });
  }
  next();
};

// Product validation
const productValidation = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Product name must be between 1 and 200 characters.'),
  body('sku')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('SKU must be between 1 and 100 characters.'),
  body('category_id')
    .isUUID()
    .withMessage('Valid category ID is required.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('compare_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number.'),
  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer.'),
  body('status')
    .optional()
    .isIn(['active', 'draft', 'archived'])
    .withMessage('Status must be active, draft, or archived.'),
  body('product_type')
    .optional()
    .isIn(['simple', 'variable', 'digital', 'subscription'])
    .withMessage('Product type must be simple, variable, digital, or subscription.'),
  handleValidationErrors
];

// Query validation for listing
const listValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number.'),
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number.'),
  query('sort_by')
    .optional()
    .isIn(['name', 'price', 'created_at', 'updated_at', 'stock_quantity', 'sales_count'])
    .withMessage('Invalid sort field.'),
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC.'),
  handleValidationErrors
];

// Bulk operations validation
const bulkValidation = [
  body('action')
    .isIn(['delete', 'update_status', 'update_category', 'toggle_featured'])
    .withMessage('Invalid action.'),
  body('product_ids')
    .isArray({ min: 1 })
    .withMessage('Product IDs array is required.'),
  body('product_ids.*')
    .isUUID()
    .withMessage('Each product ID must be a valid UUID.'),
  handleValidationErrors
];

// Routes
router.get('/', listValidation, productController.getProducts);
router.get('/low-stock', authMiddleware, authorize('super_admin', 'admin', 'manager'), productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.post('/', authMiddleware, authorize('super_admin', 'admin', 'manager'), productValidation, productController.createProduct);
router.put('/:id', authMiddleware, authorize('super_admin', 'admin', 'manager'), productValidation, productController.updateProduct);
router.delete('/:id', authMiddleware, authorize('super_admin', 'admin'), productController.deleteProduct);
router.post('/bulk', authMiddleware, authorize('super_admin', 'admin', 'manager'), bulkValidation, productController.bulkOperations);

module.exports = router;