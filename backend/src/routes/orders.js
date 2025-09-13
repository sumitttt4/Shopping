const express = require('express');
const { body, validationResult, query } = require('express-validator');
const orderController = require('../controllers/orderController');
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

// Query validation for listing orders
const listValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date.'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date.'),
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'])
    .withMessage('Invalid order status.'),
  query('payment_status')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status.'),
  query('fulfillment_status')
    .optional()
    .isIn(['unfulfilled', 'partial', 'fulfilled'])
    .withMessage('Invalid fulfillment status.'),
  handleValidationErrors
];

// Status update validation
const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'])
    .withMessage('Invalid order status.'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Notes must not exceed 1000 characters.'),
  body('tracking_number')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Tracking number must be between 1 and 100 characters.'),
  body('shipping_method')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Shipping method must be between 1 and 100 characters.'),
  handleValidationErrors
];

// Payment status update validation
const paymentStatusValidation = [
  body('payment_status')
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status.'),
  body('payment_reference')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Payment reference must be between 1 and 100 characters.'),
  handleValidationErrors
];

// Notes validation
const notesValidation = [
  body('notes')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage('Notes must be between 1 and 1000 characters.'),
  body('is_internal')
    .optional()
    .isBoolean()
    .withMessage('is_internal must be a boolean.'),
  handleValidationErrors
];

// Bulk operations validation
const bulkValidation = [
  body('action')
    .isIn(['update_status', 'update_fulfillment'])
    .withMessage('Invalid action.'),
  body('order_ids')
    .isArray({ min: 1 })
    .withMessage('Order IDs array is required.'),
  body('order_ids.*')
    .isUUID()
    .withMessage('Each order ID must be a valid UUID.'),
  handleValidationErrors
];

// Routes
router.get('/', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), listValidation, orderController.getOrders);
router.get('/statistics', authMiddleware, authorize('super_admin', 'admin', 'manager'), orderController.getOrderStatistics);
router.get('/:id', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), orderController.getOrder);
router.put('/:id/status', authMiddleware, authorize('super_admin', 'admin', 'manager'), statusUpdateValidation, orderController.updateOrderStatus);
router.put('/:id/payment-status', authMiddleware, authorize('super_admin', 'admin', 'manager'), paymentStatusValidation, orderController.updatePaymentStatus);
router.post('/:id/notes', authMiddleware, authorize('super_admin', 'admin', 'manager', 'staff'), notesValidation, orderController.addOrderNotes);
router.post('/bulk', authMiddleware, authorize('super_admin', 'admin', 'manager'), bulkValidation, orderController.bulkOrderOperations);

module.exports = router;