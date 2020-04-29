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
  User.findById('5e9ff0fb5485a71f44e73136')
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/');
      });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  // Will validate user input later
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // Look for email field in documents in users collection (email: email)
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      const user = new User({
        email,
        password,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
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
