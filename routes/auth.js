const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

// token: dynamic parameter. Has to be named token here because looking for token in request params in getNewPassword controller action
router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
