const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://natalie:lRMEZPpEz50mgjZQ@cluster0-4yuid.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Express middleware: Functions that execute during the lifecycle of a request to the Express server

// Register body parser so req.body doesn't output undefined (body-parser is currently included with Express, but installing and using it as separate middleware in case removed in future)
app.use(bodyParser.urlencoded({ extended: true }));
// Static method that ships with Express is a built-in method that serves static files. Files served statically: not handled by Express.js router or other middleware, but instead directly forwarded to the file system. Path to folder to be served statically is passed in; a folder to grant read access to. Can do this for CSS, JS, images...
// __dirname, a core Node.js feature, gives the absolute path of the directory containing the currently executing file (root folder)
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);

// Stores user in request so it can be used anywhere in app. Since this middleware runs on every incoming request before it's handled by routes, the data stored is used in same request cycle as in the route handlers, the controllers
app.use((req, res, next) => {
  User.findById('5e9ff0fb5485a71f44e73136')
    .then((user) => {
      // The user being stored in request is a full Mongoose model, so can call all Mongoose model methods on it
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// The order of these doesn't matter since using router.get rather than router.use; with get, post, etc., it's an exact match
// Addition of '/admin' makes it so only routes starting with /admin will go into the admin routes file, and Express will omit/ignore that segment in the URL when it tries to match routes in routes file
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Catchall middleware; for requests to path without any fitting middleware
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Natalie',
          email: 'natalie@test.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
