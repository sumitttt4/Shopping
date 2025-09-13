const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [10, 20]
      }
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'not_specified'),
      allowNull: true,
      defaultValue: 'not_specified'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      allowNull: false,
      defaultValue: 'active'
    },
    customer_group: {
      type: DataTypes.ENUM('regular', 'vip', 'wholesale', 'new'),
      allowNull: false,
      defaultValue: 'new'
    },
    total_orders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total_spent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    average_order_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    last_order_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '[]' : [],
      get() {
        const value = this.getDataValue('tags');
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
          this.setDataValue('tags', JSON.stringify(value || []));
        } else {
          this.setDataValue('tags', value || []);
        }
      }
    },
    accepts_marketing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    addresses: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '[]' : [],
      get() {
        const value = this.getDataValue('addresses');
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
          this.setDataValue('addresses', JSON.stringify(value || []));
        } else {
          this.setDataValue('addresses', value || []);
        }
      }
    }
  }, {
    tableName: 'customers',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['status'] },
      { fields: ['customer_group'] },
      { fields: ['total_orders'] },
      { fields: ['total_spent'] },
      { fields: ['last_order_date'] },
      { fields: ['tags'], using: 'gin' },
      { fields: ['first_name', 'last_name'] }
    ]
  });

  // Instance methods
  Customer.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  Customer.prototype.updateOrderStats = async function(orderValue) {
    await this.increment('total_orders');
    await this.increment('total_spent', { by: orderValue });
    
    // Recalculate average order value
    const newAverage = (parseFloat(this.total_spent) + orderValue) / (this.total_orders + 1);
    await this.update({
      average_order_value: newAverage,
      last_order_date: new Date()
    });
  };

  Customer.prototype.getCustomerSegment = function() {
    if (this.total_orders === 0) return 'new';
    if (this.total_spent >= 1000) return 'vip';
    if (this.total_orders >= 5) return 'regular';
    return 'new';
  };

  Customer.prototype.addAddress = async function(address) {
    const addresses = this.addresses || [];
    addresses.push(address);
    await this.update({ addresses });
  };

  // Class methods
  Customer.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  Customer.findVipCustomers = function() {
    return this.findAll({
      where: { customer_group: 'vip' },
      order: [['total_spent', 'DESC']]
    });
  };

  Customer.findTopCustomers = function(limit = 10) {
    return this.findAll({
      order: [['total_spent', 'DESC']],
      limit
    });
  };

  return Customer;
};