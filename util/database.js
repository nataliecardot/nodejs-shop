const mysql = require('mysql2');

// There are 2 ways of connecting to a SQL database: 1) Set up one connection [to database server] to use for running queries (closing and repening it over and over). Downside: Must reexecute code to create the connection for every new query, and many queries (fetch data, write data, delete data); creating new connections all the time is inefficient, both in code and with regard to performance cost connecting to database 2) Connection pool: better alternative; you do not open and close a single connection to your database, but instead create a "pool" of open connections to reuse. Once a single query is done executing, it puts the connection back into the pool and it becomes available for use again. The connections in the pool aren't opened and closed, but checked in/out
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
