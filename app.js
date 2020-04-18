const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Express middleware: Functions that execute during the lifecycle of a request to the Express server

// Register body parser so req.body doesn't output undefined
// body-parser is currently included with Express, but installing and using it as separate middleware just in case removed in future
app.use(bodyParser.urlencoded({ extended: true }));
// Static method that ships with Express is a built-in method that serves static files. Files served statically: not handled by Express.js router or other middleware, but instead directly forwarded to the file system. Path to folder to be served statically is passed in; a folder to grant read access to. Can do this for CSS, JS, images...
// __dirname, a core Node.js feature, gives the absolute path of the directory containing the currently executing file (root folder)
app.use(express.static(path.join(__dirname, 'public')));

// Stores user in request so it can be used anywhere in app
app.use((req, res, next) => {
  User.findById('5e9b29fdb0730b1fb47ac1d1')
    .then((user) => {
      // Storing instantiated User enables use of user class methods
      req.user = new User(user.name, user.email, user.cart, user._id);
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

mongoConnect(() => {
  app.listen(3000);
});
