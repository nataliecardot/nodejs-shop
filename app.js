const path = require('path');
const fs = require('fs');
// const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { uuid } = require('uuidv4');
const helmet = require('helmet');
const compression = require('compression');
const favicon = require('serve-favicon');
// const morgan = require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');
const aws = require('aws-sdk');

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

// S3 upload/file handling

// Don't want to start server until file is read in, thus using synchronous version
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // First arg is for error message to throw to inform multer something is wrong with incoming file and it should not store it; with null, telling multer okay to store it
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, uuid());
//   },
// });

const fileFilter = (req, file, cb) => {
  file.mimetype === 'image/png' ||
  file.mimetype === 'image/jpg' ||
  file.mimetype === 'image/jpeg'
    ? cb(null, true)
    : cb(null, false);
};

// AWS S3 service interface object (docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2',
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'nodejs-shop',
    acl: 'public-read',
    // Callback that accepts the request and file, and returns a metadata object to be saved to S3
    metadata(req, file, cb) {
      // fieldname: the key passed to single() -- 'image'
      cb(null, { fieldName: file.fieldname });
    },
    // key: name of file
    key(req, file, cb) {
      cb(null, `${uuid()}.jpg`);
    },
  }),
  fileFilter,
});

app.use(upload.single('image'));

// END S3 upload/file handling

app.set('view engine', 'ejs');
// Setting this explicity even though the views folder in main directory is where the view engine looks for views by default
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Create write stream (for passing to morgan, used to log request data), for logging request data in file instead of console
// flags: 'a': a is for append; new data will be appended to that file (additional log statements are added to end of existing file rather than overwriting it)
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, 'access.log'),
//   { flags: 'a' }
// );

// Set secure response header(s) with Helmet
// In my app, in developer tools (in the network tab) I can see it added one additional response header for localhost, Strict-Transport-Security. This HTTP header tells browsers to stick with HTTPS and never visit the insecure HTTP version. Once a browser sees this header, it will only visit the site over HTTPS for the next 60 days
app.use(helmet());
// Compress assets. Note: Compression is normally done by hosting providers, but deploying to Heroku which does offer it
app.use(compression());
// Log request data using writable file stream created above. Which data is logged and how to format it is passed into funtion
// Also normally handled by hosting providers
// app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'images')));
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

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

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
    // First arg for createServer() configures server, second is request handler, in this case, Express application
    // Commenting out because just as with request logging and asset compression, it's handled by hosting provider, and browsers don't accept custom/self-signed certificate; will be displayed as insecure with a message that connection is not private
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
