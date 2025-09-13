// Quick script to fix JSONB fields for SQLite compatibility
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');
const models = ['Order.js', 'OrderItem.js', 'AuditLog.js'];

const jsonbTemplate = (fieldName, defaultValue = '{}') => `
    ${fieldName}: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '${defaultValue}' : ${defaultValue === '{}' ? '{}' : defaultValue},
      get() {
        const value = this.getDataValue('${fieldName}');
        if (sequelize.getDialect() === 'sqlite') {
          try {
            return JSON.parse(value || '${defaultValue}');
          } catch {
            return ${defaultValue === '{}' ? '{}' : defaultValue};
          }
        }
        return value || ${defaultValue === '{}' ? '{}' : defaultValue};
      },
      set(value) {
        if (sequelize.getDialect() === 'sqlite') {
          this.setDataValue('${fieldName}', JSON.stringify(value || ${defaultValue === '{}' ? '{}' : defaultValue}));
        } else {
          this.setDataValue('${fieldName}', value || ${defaultValue === '{}' ? '{}' : defaultValue});
        }
      }
    }`;

const arrayTemplate = (fieldName) => `
    ${fieldName}: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '[]' : [],
      get() {
        const value = this.getDataValue('${fieldName}');
        if (sequelize.getDialect() === 'sqlite') {
          try {
            return JSON.parse(value || '[]');
          } catch {
            return [];
          }
        }
        return value || [];
      },
      set(value) {
        if (sequelize.getDialect() === 'sqlite') {
          this.setDataValue('${fieldName}', JSON.stringify(value || []));
        } else {
          this.setDataValue('${fieldName}', value || []);
        }
      }
    }`;

// This is just a template - we'll do the replacements manually
console.log('JSONB template:');
console.log(jsonbTemplate('billing_address'));
console.log('\nArray template:');
console.log(arrayTemplate('tracking_info'));