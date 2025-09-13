const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 220],
        is: /^[a-z0-9-]+$/
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
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
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0
      }
    },
    track_quantity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    status: {
      type: DataTypes.ENUM('active', 'draft', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    },
    visibility: {
      type: DataTypes.ENUM('visible', 'hidden', 'search_only'),
      allowNull: false,
      defaultValue: 'visible'
    },
    product_type: {
      type: DataTypes.ENUM('simple', 'variable', 'digital', 'subscription'),
      allowNull: false,
      defaultValue: 'simple'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    attributes: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: true,
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
    seo_title: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    seo_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seo_keywords: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sales_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rating_average: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      }
    },
    rating_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'products',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['sku'], unique: true },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['visibility'] },
      { fields: ['product_type'] },
      { fields: ['featured'] },
      { fields: ['created_by'] },
      { fields: ['stock_quantity'] },
      { fields: ['price'] },
      { fields: ['name'] }
    ],
    hooks: {
      beforeValidate: (product) => {
        if (product.name && !product.slug) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    }
  });

  // Instance methods
  Product.prototype.isLowStock = function() {
    return this.track_quantity && this.stock_quantity <= this.low_stock_threshold;
  };

  Product.prototype.isInStock = function() {
    return !this.track_quantity || this.stock_quantity > 0;
  };

  Product.prototype.getDiscountPercentage = function() {
    if (this.compare_price && this.compare_price > this.price) {
      return Math.round(((this.compare_price - this.price) / this.compare_price) * 100);
    }
    return 0;
  };

  Product.prototype.incrementViews = async function() {
    await this.increment('views_count');
  };

  Product.prototype.updateStock = async function(quantity, operation = 'subtract') {
    if (!this.track_quantity) return;
    
    if (operation === 'subtract') {
      await this.decrement('stock_quantity', { by: quantity });
    } else {
      await this.increment('stock_quantity', { by: quantity });
    }
  };

  // Class methods
  Product.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  Product.findBySku = function(sku) {
    return this.findOne({ where: { sku } });
  };

  Product.findFeatured = function(limit = 10) {
    return this.findAll({
      where: { featured: true, status: 'active' },
      limit,
      order: [['created_at', 'DESC']]
    });
  };

  Product.findLowStock = function() {
    return this.findAll({
      where: {
        track_quantity: true,
        status: 'active'
      },
      having: sequelize.where(
        sequelize.col('stock_quantity'),
        '<=',
        sequelize.col('low_stock_threshold')
      )
    });
  };

  return Product;
};