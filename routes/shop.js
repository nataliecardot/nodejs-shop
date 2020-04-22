const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// Dynamic segment used; value held by dynamic param is extracted in shop.js controller file. Note: Route with dynamic segments must go after specific route starting with /products/, e.g., /products/delete, otherwise the dynamic segment route will be fired first and the specific route won't be reached (because the "delete" part would be assumed to be the dynamic value)
router.get('/products/:productId', shopController.getProduct);

// router.get('/cart', shopController.getCart);

// router.post('/cart', shopController.postCart);

// router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// router.post('/create-order', shopController.postOrder);

// router.get('/orders', shopController.getOrders);

module.exports = router;
