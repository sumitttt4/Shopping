const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'product_variants',
        key: 'id'
      }
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    variant_title: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    product_snapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Snapshot of product data at time of order'
    }
  }, {
    tableName: 'order_items',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['product_id'] },
      { fields: ['variant_id'] },
      { fields: ['sku'] }
    ],
    hooks: {
      beforeSave: (item) => {
        if (item.changed('quantity') || item.changed('price')) {
          item.total = item.quantity * item.price;
        }
      }
    }
  });

  // Instance methods
  OrderItem.prototype.getDisplayName = function() {
    return this.variant_title ? 
      `${this.product_name} - ${this.variant_title}` : 
      this.product_name;
  };

  return OrderItem;
};