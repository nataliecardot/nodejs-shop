const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
  '/signup',
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    // Method found in validator.js docs. validator.js implicitly installed with express-validator
    .custom((value, { req }) => {
      if (value === 'test1@test.com') {
        throw new Error('This email is forbidden');
      }
      return true;
    }),
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

// token: dynamic parameter. Has to be named token here because looking for token in request params in getNewPassword controller action
router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
