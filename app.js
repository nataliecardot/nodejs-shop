const express = require('express');

const app = express();

// The callback will be executed for every incoming request
// Next is a function passed as an argument to the use method's callback function hy Express, and it has to be executed to allow the request to travel on to next middleware in line. If we don't call next, should send a response, because otherwise the request can't continue its journey (and note you can only send one response per request. If you were to call next() after sending a response, the next middleware would be fired, but the response in that one wouldn't be sent)
app.use((req, res, next) => {
  console.log('In the middleware!');
  next();
});

app.use((req, res, next) => {
  console.log('In another middleware!');
  // send is Express utility function that allows us to send response, and attach a body of type any; Express sets content type automatically based on content, but only if you haven't set one manually (with Node.js setHeader method)
  res.send('<h1>Hello from Express!</h1>');
});

app.use((req, res, next) => {
  console.log('Test');
  res.send('<h1>Hello from Eess!</h1>');
});

// Express shorthand
app.listen(3000);
