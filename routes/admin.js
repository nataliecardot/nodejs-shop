const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// Like a mini Express app pluggable into the other Express app
const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be 3 to 50 characters in length.'),
    body('imageUrl').trim().isURL(),
    body('price').isFloat(),
    body('description')
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage('Description must be 5 to 400 characters in length.'),
  ],
  isAuth,
  adminController.postAddProduct
);

// Using dynamic path segment
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage('Title must be 3 to 50 characters in length.'),
    body('imageUrl').trim().isURL(),
    body('price').isFloat(),
    body('description')
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage('Description must be 5 to 400 characters in length.'),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
