// models/Campaign.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Campaign name is required' },
      len: {
        args: [3, 100],
        msg: 'Name must be between 3 and 100 characters'
      }
    }
  },

  des: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: {
        args: [5, 500],
        msg: 'Description must be between 5 and 500 characters'
      }
    }
  },

  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Invalid start date' }
    }
  },

  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Invalid end date' }
    }
  },

  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Active',
    validate: {
      isIn: {
        args: [['Active', 'Inactive']],
        msg: 'Status must be Active or Inactive'
      }
    }
  }

}, {
  tableName: 'campaigns',
  timestamps: true
});

module.exports = Campaign;