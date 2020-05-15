const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  // process object is globally available in Node app; part of Node core runtime. The env property contains all the environment variables known by the process object. Using nodemon.json to store environment variables but could alternatively use dotenv package for this (see https://www.youtube.com/watch?v=17UVejOw3zA)
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-4yuid.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
// Secret used for signing/hashing token is stored in session by default
const csrfProtection = csrf({});

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    // catch block will be executed in the case of technical issue (e.g., database down, or insufficient permissions to execute findById())
    .catch((err) => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  // Locals field: Express feature for setting local variables that are passed into views. For every request that is executed, these fields are set for view that is rendered
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
