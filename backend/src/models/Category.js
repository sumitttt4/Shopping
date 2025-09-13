const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 120],
        is: /^[a-z0-9-]+$/
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
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
    product_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    attributes: {
      type: sequelize.getDialect() === 'sqlite' ? DataTypes.TEXT : DataTypes.JSONB,
      allowNull: true,
      defaultValue: sequelize.getDialect() === 'sqlite' ? '[]' : [],
      get() {
        const value = this.getDataValue('attributes');
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
          this.setDataValue('attributes', JSON.stringify(value || []));
        } else {
          this.setDataValue('attributes', value || []);
        }
      }
    }
  }, {
    tableName: 'categories',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['parent_id'] },
      { fields: ['status'] },
      { fields: ['sort_order'] },
      { fields: ['name'] }
    ],
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    }
  });

  // Instance methods
  Category.prototype.getPath = async function() {
    const path = [this];
    let current = this;
    
    while (current.parent_id) {
      current = await Category.findByPk(current.parent_id);
      if (current) {
        path.unshift(current);
      } else {
        break;
      }
    }
    
    return path;
  };

  Category.prototype.getDepth = async function() {
    let depth = 0;
    let current = this;
    
    while (current.parent_id) {
      current = await Category.findByPk(current.parent_id);
      if (current) {
        depth++;
      } else {
        break;
      }
    }
    
    return depth;
  };

  // Class methods
  Category.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  Category.findRootCategories = function() {
    return this.findAll({
      where: { parent_id: null },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
  };

  Category.findWithChildren = function() {
    return this.findAll({
      include: [{
        model: Category,
        as: 'children',
        include: [{
          model: Category,
          as: 'children'
        }]
      }],
      where: { parent_id: null },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
        [{ model: Category, as: 'children' }, 'sort_order', 'ASC'],
        [{ model: Category, as: 'children' }, 'name', 'ASC']
      ]
    });
  };

  return Category;
};