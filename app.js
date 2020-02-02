const http = require('http');

const express = require('express');

const app = express();

// The callback will be executed for every incoming request
// Next is a function passed as an argument to the use method's callback function hy Express, and it has to be executed to allow the request to travel on to next middleware in line. If we don't call next, should send a response, because otherwise the request can't continue its journey
app.use((req, res, next) => {
  console.log('In the middleware!');
  next();
});

app.use((req, res, next) => {
  console.log('In another middleware!');
});

// using the express function stored in app constant as request handler
const server = http.createServer(app);

server.listen(3000);
