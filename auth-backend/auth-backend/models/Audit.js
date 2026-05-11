const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Audit = sequelize.define('Audit', {

  oldData: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  newData: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  module: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  },

  action: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  }

}, {
  tableName: 'audit_logs',
  timestamps: true
});

module.exports = Audit;