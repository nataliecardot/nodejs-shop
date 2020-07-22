const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

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
    pageTitle: 'Log In',
    // Only set if there was an error (no user with email/password) from login POST request. Whatever was stored under key 'error' is retrieved and stored in errorMessage, and then this info is removed from session
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  message.length > 0 ? (message = message[0]) : (message = null);
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Log In',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Log In',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email,
            password,
          },
          validationErrors: [],
        });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Log In',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email,
              password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  // Generates hashed password. Asynchronous task; returns a promise. Second arg is salt value (how many rounds of hashing will be applied)
  bcrypt
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
        from: 'cardotmedia@gmail.com',
        subject: 'Welcome to süß.',
        html: '<h3>You have successfully signed up.</h3>',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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

exports.postResetPassword = (req, res, next) => {
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
            <p>We received your süß account password reset request.</p>
            <p>To set a new password, use this <a href="https://suess.herokuapp.com/reset-password/${token}">link</a>.</p>
            <p>If you did not submit a request to change your password, please disregard this message.</p>
          `,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  // Check whether there is a user for token in URL and that token is not expired. $gt operator: greater than
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      // This will be the case if a password reset link is clicked after it was already used, since resetToken and resetTokenExpiration fields are set to undefined after password is reset. Also displayed if random text entered in place of token in reset password page URL
      if (!user) {
        req.flash(
          'error',
          'Invalid password reset link. To reset your password, submit a new request.'
        );
        return res.redirect('/login');
      }
      let message = req.flash('error');
      message.length > 0 ? (message = message[0]) : (message = null);
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const { userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      transporter.sendMail({
        to: resetUser.email,
        from: 'cardotmedia@gmail.com',
        subject: 'Password reset successful',
        html: `<p>Your Node Shop password has been changed.</p>`,
      });

      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
