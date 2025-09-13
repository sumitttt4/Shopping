const { DataTypes } = require('sequelize');

// Helper functions for database compatibility between SQLite and PostgreSQL
const createJsonField = (sequelize, defaultValue = {}) => ({
  type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
  allowNull: true,
  defaultValue: sequelize.getDialect() === 'sqlite' 
    ? JSON.stringify(defaultValue) 
    : defaultValue,
  get() {
    const value = this.getDataValue(arguments[0] || 'unknown_field');
    if (sequelize.getDialect() === 'sqlite') {
      try {
        return JSON.parse(value || JSON.stringify(defaultValue));
      } catch {
        return defaultValue;
      }
    }
    return value || defaultValue;
  },
  set(value) {
    if (sequelize.getDialect() === 'sqlite') {
      this.setDataValue(arguments[0] || 'unknown_field', JSON.stringify(value || defaultValue));
    } else {
      this.setDataValue(arguments[0] || 'unknown_field', value || defaultValue);
    }
  }
});

const createArrayField = (sequelize, elementType = DataTypes.STRING, defaultValue = []) => ({
  type: sequelize.getDialect() === 'sqlite' 
    ? DataTypes.TEXT 
    : DataTypes.ARRAY(elementType),
  allowNull: true,
  defaultValue: sequelize.getDialect() === 'sqlite' 
    ? JSON.stringify(defaultValue) 
    : defaultValue,
  get() {
    const value = this.getDataValue(arguments[0] || 'unknown_field');
    if (sequelize.getDialect() === 'sqlite') {
      try {
        return JSON.parse(value || JSON.stringify(defaultValue));
      } catch {
        return defaultValue;
      }
    }
    return value || defaultValue;
  },
  set(value) {
    if (sequelize.getDialect() === 'sqlite') {
      this.setDataValue(arguments[0] || 'unknown_field', JSON.stringify(value || defaultValue));
    } else {
      this.setDataValue(arguments[0] || 'unknown_field', value || defaultValue);
    }
  }
});

module.exports = {
  createJsonField,
  createArrayField
};