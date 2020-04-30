const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://natalie:lRMEZPpEz50mgjZQ@cluster0-4yuid.mongodb.net/shop';

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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  // Express feature: set local variables passed into views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
