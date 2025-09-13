const express = require('express');
const { body, validationResult, query } = require('express-validator');
const categoryController = require('../controllers/categoryController');
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

// Category validation
const categoryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Category name must be between 1 and 100 characters.'),
  body('slug')
    .optional()
    .isLength({ min: 1, max: 120 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens.'),
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID.'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive.'),
  handleValidationErrors
];

// Sort order validation
const sortOrderValidation = [
  body('categories')
    .isArray({ min: 1 })
    .withMessage('Categories array is required.'),
  body('categories.*.id')
    .isUUID()
    .withMessage('Each category ID must be a valid UUID.'),
  body('categories.*.sort_order')
    .isInt({ min: 0 })
    .withMessage('Each sort order must be a non-negative integer.'),
  handleValidationErrors
];

// Routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/analytics', authMiddleware, authorize('super_admin', 'admin', 'manager'), categoryController.getCategoryAnalytics);
router.post('/', authMiddleware, authorize('super_admin', 'admin', 'manager'), categoryValidation, categoryController.createCategory);
router.put('/:id', authMiddleware, authorize('super_admin', 'admin', 'manager'), categoryValidation, categoryController.updateCategory);
router.delete('/:id', authMiddleware, authorize('super_admin', 'admin'), categoryController.deleteCategory);
router.put('/sort-order', authMiddleware, authorize('super_admin', 'admin', 'manager'), sortOrderValidation, categoryController.updateSortOrder);

module.exports = router;