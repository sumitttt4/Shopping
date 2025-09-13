const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    compare_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    dimensions: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('dimensions');
        if (sequelize.getDialect() === 'sqlite' && value) {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      },
      set(value) {
        if (sequelize.getDialect() === 'sqlite') {
          this.setDataValue('dimensions', value ? JSON.stringify(value) : null);
        } else {
          this.setDataValue('dimensions', value);
        }
      }
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    attributes: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: false,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '{}' : {},
      get() {
        const value = this.getDataValue('attributes');
        if (sequelize.getDialect() === 'sqlite') {
          try {
            return JSON.parse(value || '{}');
          } catch {
            return {};
          }
        }
        return value || {};
      },
      set(value) {
        if (sequelize.getDialect() === 'sqlite') {
          this.setDataValue('attributes', JSON.stringify(value || {}));
        } else {
          this.setDataValue('attributes', value || {});
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'product_variants',
    indexes: [
      { fields: ['sku'], unique: true },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['sort_order'] },
      { fields: ['attributes'], using: 'gin' }
    ]
  });

  // Instance methods
  ProductVariant.prototype.isInStock = function() {
    return this.stock_quantity > 0;
  };

  ProductVariant.prototype.getDiscountPercentage = function() {
    if (this.compare_price && this.compare_price > this.price) {
      return Math.round(((this.compare_price - this.price) / this.compare_price) * 100);
    }
    return 0;
  };

  ProductVariant.prototype.updateStock = async function(quantity, operation = 'subtract') {
    if (operation === 'subtract') {
      await this.decrement('stock_quantity', { by: quantity });
    } else {
      await this.increment('stock_quantity', { by: quantity });
    }
  };

  return ProductVariant;
};