const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Express middleware are functions that execute during the lifecycle of a request to the Express server

// Register body parser so req.body doesn't output undefined
// Using body-parser. It's currently included with Express, but including (installing and using it as separate middleware) just in case it's removed in the future (it has been removed and added a handful of times)
// bodyParser.urlencoded() registers a middleware, i.e., passing a function like (req, res, next) => {} even though we can't see it. Calls next() in the end
// Doesn't parse all types of bodies (files, JSON, etc.), but will parse bodies like one we're getting here (sent through form)
// When extended property is set to true, the URL-encoded data will be parsed with the qs library. qs library allows you to create a nested object from your query string. Using this instead of extended: false to get rid of [Object: null prototype] in console (which appears because with that setting, it's parsed by query-string library. The object returned by the querystring.parse() method does not prototypically inherit from the JavaScript Object. This means that typical Object methods such as obj.toString(), obj.hasOwnProperty(), and others are not defined and will not work. In other words, they have null prototype)
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/add-product', (req, res) => {
  res.send(
    '<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>'
  );
});

app.use('/product', (req, res) => {
  // Get body of incoming request with body field provided by Express
  // By default, request doesn't try to parse incoming request body. To do that, have to register a parser by adding another middleware (done above)
  // Once parser is registered, yields JavaScript object with key-value pair
  console.log(req.body);
  // Don't have to set status code and location header using this Express convenience method
  res.redirect('/');
});

// '/' is default
app.use('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>');
});

// Express shorthand
app.listen(3000);
