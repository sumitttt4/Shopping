const express = require('express');
const { query, validationResult } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
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

// Analytics query validation
const analyticsValidation = [
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Period must be between 1 and 365.'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date.'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date.'),
  query('type')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Type must be one of: daily, weekly, monthly, yearly.'),
  handleValidationErrors
];

// Routes - All analytics routes require at least manager level access
router.get('/dashboard', authMiddleware, authorize('super_admin', 'admin', 'manager'), analyticsController.getDashboardData);
router.get('/sales', authMiddleware, authorize('super_admin', 'admin', 'manager'), analyticsValidation, analyticsController.getSalesAnalytics);
router.get('/products', authMiddleware, authorize('super_admin', 'admin', 'manager'), analyticsValidation, analyticsController.getProductAnalytics);
router.get('/customers', authMiddleware, authorize('super_admin', 'admin', 'manager'), analyticsValidation, analyticsController.getCustomerAnalytics);
router.get('/revenue', authMiddleware, authorize('super_admin', 'admin', 'manager'), analyticsValidation, analyticsController.getRevenueAnalytics);

module.exports = router;