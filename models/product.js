// Capitalized because it's a constructor function/class
const Sequelize = require('sequelize');

// Import database connection pool (it's actually more than a connection pool; it's a fully configured Sequelize environment, with all the features of the package), managed by Sequelize
const sequelize = require('../util/database');

// Define model that will be managed by Sequelize (it's typically lowercase). Second arg defines model structure, and therefore, structure of automatically created database table
const Product = sequelize.define('product', {
  // Attributes/fields product should have
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  // Shortcut for setting type
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;
