const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect('/login');
      }
      // Validate password. bcrypt can compare password to hashed value, and can determine whether hashed value makes sense, taking into account hashing algorithm used. So if it were hashed, could it result in hashed password?
      bcrypt
        .compare(password, user.password)
        // Will make it into then block regardless of whether passwords match. Result will be a boolean that is true if passwords are equal, false otherwise
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect('/');
            });
          }
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  // Will validate user input later
  const { email, password, confirmPassword } = req.body;
  // Look for email field in documents in users collection (email: email)
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      // Generates hashed password. Asynchronous task; returns a promise. Second arg is salt value, how many rounds of hashing will be applied
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};