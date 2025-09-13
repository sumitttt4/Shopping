require('dotenv').config();
const { sequelize } = require('../models');

async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    console.log('Synchronizing database models...');
    await sequelize.sync({ force: false }); // Set to true to recreate tables
    console.log('✓ Database models synchronized successfully.');

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };