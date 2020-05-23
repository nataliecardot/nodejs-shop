const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const { uuid } = require('uuidv4');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  // process object is globally available in Node app; part of Node core runtime. The env property contains all environment variables known by process object. Using nodemon.json to store environment variables, but could alternatively use dotenv package for this (see https://www.youtube.com/watch?v=17UVejOw3zA)
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-4yuid.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
// Secret used for signing/hashing token is stored in session by default
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  // Path
  // First arg is for error message to throw to inform multer something is wrong with incoming file and it should not store it; with null, telling multer okay to store it
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuid());
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype === 'image/png' ||
  file.mimetype === 'image/jpg' ||
  file.mimetype === 'image/jpeg'
    ? cb(null, true)
    : cb(null, false);
};

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
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
  // Locals field: Express feature for setting local variables that are passed into views. For every request that is executed, these fields are set for view that is rendered
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // When you throw an error in synchronous places (outside of callbacks and promises), Express will detect this and execute next error handling middleware. But if error is thrown within async code (in then or catch block), Express error handling middleware won't be executed; app will simply crash; have to use next()
  // throw new Error('sync dummy');
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
      // Within async code snippets, need to use next wrapping error, outside you can throw error
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// Error-handling middleware. Express executes this middleware when you call next() with an error passed to it
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Server Error',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
