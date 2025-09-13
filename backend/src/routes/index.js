const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const customerRoutes = require('./customers');
const analyticsRoutes = require('./analytics');
const uploadRoutes = require('./upload');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;