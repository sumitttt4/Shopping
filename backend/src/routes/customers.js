const express = require('express');
const { body, validationResult, query } = require('express-validator');
const customerController = require('../controllers/customerController');
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

// Customer validation
const customerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('first_name')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name must be between 1 and 50 characters.'),
  body('last_name')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name must be between 1 and 50 characters.'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be between 10 and 20 characters.'),
  body('customer_group')
    .optional()
    .isIn(['regular', 'vip', 'wholesale', 'new'])
    .withMessage('Invalid customer group.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Invalid status.'),
  handleValidationErrors
];

// Query validation for listing customers
const listValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('customer_group')
    .optional()
    .isIn(['regular', 'vip', 'wholesale', 'new'])
    .withMessage('Invalid customer group.'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Invalid status.'),
  handleValidationErrors
];

// Note validation
const noteValidation = [
  body('note')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage('Note must be between 1 and 1000 characters.'),
  handleValidationErrors
];

// Routes
router.get('/', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), listValidation, customerController.getCustomers);
router.get('/statistics', authMiddleware, authorize('super_admin', 'admin', 'manager'), customerController.getCustomerStatistics);
router.get('/:id', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), customerController.getCustomer);
router.post('/', authMiddleware, authorize('super_admin', 'admin', 'manager'), customerValidation, customerController.createCustomer);
router.put('/:id', authMiddleware, authorize('super_admin', 'admin', 'manager'), customerValidation, customerController.updateCustomer);
router.delete('/:id', authMiddleware, authorize('super_admin', 'admin'), customerController.deleteCustomer);
router.post('/:id/notes', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), noteValidation, customerController.addCustomerNote);

module.exports = router;