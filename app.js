const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Express middleware are functions that execute during the lifecycle of a request to the Express server

// Register body parser so req.body doesn't output undefined
// Using body-parser. It's currently included with Express, but including (installing and using it as separate middleware) just in case it's removed in the future (it has been removed and added a handful of times)
// bodyParser.urlencoded() registers a middleware, i.e., passing a function like (req, res, next) => {} even though can't see it. Calls next() in the end
// Doesn't parse all types of bodies (files, JSON, etc.), but will parse bodies like one getting here (sent through form)
// When extended property is set to true, the URL-encoded data will be parsed with the qs library. qs library allows you to create a nested object from your query string. However, my purpose of using this instead of extended: false to get rid of [Object: null prototype] in console (which appears because with that setting, it's parsed by query-string library. The object returned by the querystring.parse() method does not prototypically inherit from the JavaScript Object. This means that typical Object methods such as obj.toString(), obj.hasOwnProperty(), and others are not defined and will not work. In other words, they have null prototype)
app.use(bodyParser.urlencoded({ extended: true }));
// Static method that ships with Express is a built-in method that serves static files. Files served statically: not handled by Express.js router or other middleware, but instead directly forwarded to the file system. Path to folder to be served statically is passed in; a folder to grant read access to. Can do this for CSS, JS, images...
// __dirname, a core Node.js feature, gives the absolute path of the directory containing the currently executing file (root folder)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware stores user in request so it can be used anywhere in app
app.use((req, res, next) => {
  // Retrieve user from database
  User.findByPk(1)
    .then((user) => {
      // User being retrieved from db is not just a JS object with values stored in db; it's a Sequelize object with values stored in db along with utility methods added by Sequelize; storing Sequelize object, not JS object with field values. Thus, whenever calling req.user, can also execute methods like destroy()
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// The order of these doesn't matter since using router.get rather than router.use; with get, post, etc., it's an exact match
// Addition of '/admin' makes it so only routes starting with /admin will go into the admin routes file, and Express will omit/ignore that segment in the URL when it tries to match routes in routes file
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// Catchall middleware; for requests to path without any fitting middleware
app.use(errorController.get404);

// Don't need both, but making both relations/directions explicit
// Relates product and user models (using Sequelize). Adds userId attribute to product table to hold primary key value for user (so in product table, userId is a foreign key)
// For when user creates product (one-to-one relationship)
// onDelete: What happens to connected products if user is deleted. CASCADE means the deletion would also be executed for product
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// One user can add more than one product to shop. Adds userId to product table
User.hasMany(Product);
// Adds userId attribute to cart table
User.hasOne(Cart);
Cart.belongsTo(User); // Inverse of above. Optional (one direction is sufficient) but making explicit
// Many-many relationship; one cart can hold multiple products, and single product can be part of multiple carts. Only works with intermediate table that connects them, which stores both product and cart IDs (cartitems table). through key tells Sequelize where the connections should be stored (said intermediary table)/which table to use as inbetween model and thus inbetween table
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// Creates tables for all models that were defined using define method on instance of Sequelize, and relations as defined above. "Syncs models to database by creating appropriate tables, and if applicable, relations"
// Note: When table is created for model, it is automatically pluralized ('product' model => 'products' table)
sequelize
  // Setting force to true drops existing table(s) and recreates as required; using so that newly added relations are incorporated (wouldn't use in production)
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Natalie', email: 'test@test.com' });
    }
    // Note: If you return a value in a then block, it's automatically wrapped into a new promises
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    // Express shorthand that starts Node.js server at specified port, identical to Node's http.Server.listen() method
    app.listen(3000);
  })
  .catch((err) => console.log(err));
