const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', shopController.getHomepage);

router.get('/products', shopController.getProducts);

// Dynamic segment used; value held by dynamic param is extracted in shop.js controller file. Note: Route with dynamic segments must go after specific route starting with /products/, e.g., /products/delete, otherwise the dynamic segment route will be fired first and the specific route won't be reached (because the "delete" part would be assumed to be the dynamic value)
router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

// router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
