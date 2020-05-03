const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// sendgridTransport() returns a configuration nodemailer can use to use SendGrid
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_PASSWORD,
    },
  })
);

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  // Workaround to solve issue of user message div being rendered even if no error, since otherwise errorMessage holds an empty array (truthy)
  message.length > 0 ? (message = message[0]) : (message = null);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    // Only set if there was an error (no user with email/password) from login POST request. Whatever was stored under key 'error' is retrieved and stored in errorMessage, and then this info is removed from session
    errorMessage: message,
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  message.length > 0 ? (message = message[0]) : (message = null);
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: message,
  });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // Key under which message will be stored, and message. Available in session until used
        req.flash('error', 'Invalid email or password.');
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
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res) => {
  // Will validate user input later
  const { email, password, confirmPassword } = req.body;
  // Look for email field in documents in users collection (email: email)
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'Email already in use.');
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
          // sendMail() provides a promise. Returning in order to chain .catch() and catch any errors
          return transporter.sendMail({
            to: email,
            from: 'shop@nodecomplete.com',
            subject: 'Welcome to Node Shop!',
            html: '<h1>You have successfully signed up.</h1>',
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};

exports.getResetPassword = (req, res) => {
  let message = req.flash('error');
  message.length > 0 ? (message = message[0]) : (message = null);
  res.render('auth/reset-password', {
    path: '/reset-password',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return redirect('/reset-password');
    }
    // Passing `hex` because buffer stores hexadecimal values, and toString() needs that info to convert to ASCII characters
    // Will look for token from URL in database to confirm password reset link was sent by app/server
    const token = buffer.toString('hex');
    // From password reset page email field
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash(
            'error',
            'No account with the provided email address exists.'
          );
          return res.redirect('/reset-password');
        }
        user.resetToken = token;
        // 3600000 ms = 1 hour
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'cardotmedia@gmail.com',
          subject: 'Password reset',
          html: `
            <p>We received your password reset request.</p>
            <p>To set a new password, use this <a href="http://localhost:3000/reset-password/${token}">link</a>.</p>
            <p>If you did not submit a request to change your password, please disregard this message.</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};
