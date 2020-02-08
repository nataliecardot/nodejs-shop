const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Express middleware are functions that execute during the lifecycle of a request to the Express server

// Register body parser so req.body doesn't output undefined
// Using body-parser. It's currently included with Express, but including (installing and using it as separate middleware) just in case it's removed in the future (it has been removed and added a handful of times)
// bodyParser.urlencoded() registers a middleware, i.e., passing a function like (req, res, next) => {} even though we can't see it. Calls next() in the end
// Doesn't parse all types of bodies (files, JSON, etc.), but will parse bodies like one we're getting here (sent through form)
// When extended property is set to true, the URL-encoded data will be parsed with the qs library. qs library allows you to create a nested object from your query string. However, my purpose of using this instead of extended: false to get rid of [Object: null prototype] in console (which appears because with that setting, it's parsed by query-string library. The object returned by the querystring.parse() method does not prototypically inherit from the JavaScript Object. This means that typical Object methods such as obj.toString(), obj.hasOwnProperty(), and others are not defined and will not work. In other words, they have null prototype)
app.use(bodyParser.urlencoded({ extended: true }));

// The order of these doesn't matter, but only because using get rather than router.use in shop.js; with get, post, etc., it's an exact match -- not the case if you change it to router.use. still, better to care about the order in case it's changed back to router.use
// Addition of '/admin' makes it so only routes starting with /admin will go into the admin routes file, and Express will omit/ignore that segment in the URL when it tries to match the routes in the routes file; it's like stripping it out (so you don't have to keep repeating it in each route)
// So the filtering mechanism allows us to add a common starting segment for our path, which all routes in a given file use, to outsource that into this file so we don't have to repeat it for all the routes in the route file
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// Catchall middleware; for requests to path without any fitting middleware
app.use((req, res) => {
  // Can chain status Express convenience method to set status code, setHeader ... send just has to be the last method in the chain
  // Don't have to go up a level since already in the root folder
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Express shorthand
app.listen(3000);
