const mysql = require('mysql2');

// There are 2 ways of connecting to a SQL database: 1) Set up one connection to use for running queries. Should close connection once done with query. Downside: Must reexecute code to create the connection for every new query, and many queries (fetch data, write data, delete data); creating new connections all the time is inefficient, both in code and with regard to performance cost connecting to database 2) Connection pool: better alternative

// Create pool of connections to always reach out to when there's a query to run => get new connection from pool that manages multiple connections, so multiple queries can be run simultaneously (each query needs its own connection). Once query is done, the connection will be handed back into the pool, available for a new query
const pool = mysql.createPool({
  // Info about database engine/host connecting to
  // Host: server IP address/name (localhost since running on own machine)
  host: 'localhost',
  user: 'root',
  // host and user provides access to database server, but that server typically has multiple databases
  // Schema with custom name created in MySQL
  database: 'node-complete',
  password: 'unicorns for life'
});

// The promise part allows using promises when working with these connections; get promises when executing queries
module.exports = pool.promise();
