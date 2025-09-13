const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.USE_SQLITE === 'true') {
  // SQLite configuration for development - simplified approach
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
  console.log('Using SQLite database for development');
} else {
  // PostgreSQL configuration
  sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'shopping_admin',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const ProductVariant = require('./ProductVariant')(sequelize);
const ProductImage = require('./ProductImage')(sequelize);
const Customer = require('./Customer')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// Define associations
const setupAssociations = () => {
  // Category associations
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

  // Product associations
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

  // Product variant associations
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Product image associations
  ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Customer associations
  Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

  // Order associations
  Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

  // Order item associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  // Audit log associations
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

setupAssociations();

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Customer,
  Order,
  OrderItem,
  AuditLog
};