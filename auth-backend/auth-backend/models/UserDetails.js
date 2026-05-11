// models/UserDetails.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserDetails = sequelize.define('UserDetails', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Name is required" }
    }
  },

  username: {
    type: DataTypes.STRING,
    allowNull: true
  },

  firstname: {
    type: DataTypes.STRING,
    allowNull: true
  },

  lastname: {
    type: DataTypes.STRING,
    allowNull: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Email is required" },
      isEmail: { msg: "Invalid email format" }
    }
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Phone is required" }
    }
  },

  state: {
    type: DataTypes.STRING,
    allowNull: true
  },

  city: {
    type: DataTypes.STRING,
    allowNull: true
  },

  country: {
    type: DataTypes.STRING,
    allowNull: true
  },

  zipcode: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.STRING,
    allowNull: true
  },

  action: {
    type: DataTypes.STRING,
    allowNull: false
  }

}, {
  tableName: 'user_details',
  timestamps: false
});

module.exports = UserDetails;