const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('authdb', 'root', 'Raja@0826', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql'
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connected ✅");
  } catch (error) {
    console.error("DB Error:", error);
  }
};

module.exports = { sequelize, connectDB };