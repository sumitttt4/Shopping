const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    resource_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'audit_logs',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['resource_type'] },
      { fields: ['resource_id'] },
      { fields: ['created_at'] },
      { fields: ['ip_address'] }
    ]
  });

  // Class methods
  AuditLog.logAction = async function(data) {
    return await this.create({
      user_id: data.userId,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      old_values: data.oldValues,
      new_values: data.newValues,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      metadata: data.metadata || {}
    });
  };

  AuditLog.getRecentActivity = function(limit = 50) {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit,
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name']
      }]
    });
  };

  AuditLog.getUserActivity = function(userId, limit = 50) {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  return AuditLog;
};