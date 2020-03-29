// Connect Sequelize to database. (It uses MySQL2 behind the scenes. It would create a connection pool, as was previously done manually.)

// Naming it with a capital 'S' because importing a constructor function/class
const Sequelize = require('sequelize').Sequelize;

// Create new Sequelize instance, passing args to constructor function (schema name, root username, password)
// Options object: dialect - make it clear that connecting to MySQL database, since different SQL engines/databases use slightly different SQL syntax. host - localhost would be used by default, but setting it explicitly
const sequelize = new Sequelize('node-complete', 'root', 'unicorns for life', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
