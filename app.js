const express = require('express');

const app = express();

// Express middleware are functions that execute during the lifecycle of a request to the Express server

// Middleware that should be applied to all requests
app.use('/', (req, res, next) => {
  console.log('This always runs!');
  next();
});

app.use('/add-product', (req, res, next) => {
  console.log('Test');
  res.send('<h1>The "Add Product" Page</h1>');
});

// '/' is default
app.use('/', (req, res, next) => {
  console.log('Test');
  res.send('<h1>Hello from Express!</h1>');
});

// Express shorthand
app.listen(3000);
