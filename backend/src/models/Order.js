const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'returned'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    fulfillment_status: {
      type: DataTypes.ENUM('unfulfilled', 'partial', 'fulfilled'),
      allowNull: false,
      defaultValue: 'unfulfilled'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    shipping_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    billing_address: {
      type: sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('billing_address');
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
        return value;
      },
      set(value) {
        this.setDataValue('billing_address', typeof value === 'object' ? JSON.stringify(value) : value);
      }
    },
    shipping_address: {
      type: sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('shipping_address');
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
        return value;
      },
      set(value) {
        this.setDataValue('shipping_address', typeof value === 'object' ? JSON.stringify(value) : value);
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipping_method: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.TEXT,
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'postgres' ? [] : '[]',
      get() {
        const value = this.getDataValue('tags');
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            return [];
          }
        }
        return value || [];
      },
      set(value) {
        if (sequelize.getDialect() === 'postgres') {
          this.setDataValue('tags', value);
        } else {
          this.setDataValue('tags', JSON.stringify(value || []));
        }
      }
    }
  }, {
    tableName: 'orders',
    indexes: [
      { fields: ['order_number'], unique: true },
      { fields: ['customer_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['fulfillment_status'] },
      { fields: ['created_at'] },
      { fields: ['total_amount'] },
      ...(sequelize.getDialect() === 'postgres' ? [{ fields: ['tags'], using: 'gin' }] : [])
    ],
    hooks: {
      beforeCreate: async (order) => {
        if (!order.order_number) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          order.order_number = `ORD-${timestamp}-${random}`;
        }
      }
    }
  });

  // Instance methods
  Order.prototype.calculateTotal = function() {
    return parseFloat(this.subtotal) + 
           parseFloat(this.tax_amount) + 
           parseFloat(this.shipping_amount) - 
           parseFloat(this.discount_amount);
  };

  Order.prototype.canCancel = function() {
    return ['pending', 'processing'].includes(this.status);
  };

  Order.prototype.canRefund = function() {
    return this.payment_status === 'paid' && 
           ['delivered', 'shipped'].includes(this.status);
  };

  Order.prototype.updateStatus = async function(newStatus, notes = null) {
    const updates = { status: newStatus };
    
    if (newStatus === 'shipped' && !this.shipped_at) {
      updates.shipped_at = new Date();
      updates.fulfillment_status = 'fulfilled';
    }
    
    if (newStatus === 'delivered' && !this.delivered_at) {
      updates.delivered_at = new Date();
    }
    
    if (newStatus === 'cancelled' && !this.cancelled_at) {
      updates.cancelled_at = new Date();
      if (notes) updates.cancellation_reason = notes;
    }
    
    if (notes && newStatus !== 'cancelled') {
      updates.internal_notes = this.internal_notes ? 
        `${this.internal_notes}\n\n[${new Date().toISOString()}] ${notes}` : 
        `[${new Date().toISOString()}] ${notes}`;
    }
    
    await this.update(updates);
  };

  // Class methods
  Order.findByOrderNumber = function(orderNumber) {
    return this.findOne({ where: { order_number: orderNumber } });
  };

  Order.findByStatus = function(status) {
    return this.findAll({ where: { status } });
  };

  Order.findRecentOrders = function(limit = 10) {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  };

  Order.getTotalSales = async function(startDate, endDate) {
    const where = {
      payment_status: 'paid'
    };
    
    if (startDate && endDate) {
      where.created_at = {
        [sequelize.Op.between]: [startDate, endDate]
      };
    }
    
    const result = await this.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
      ],
      raw: true
    });
    
    return result[0];
  };

  return Order;
};