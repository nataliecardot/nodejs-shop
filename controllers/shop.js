// All product-related logic (controller connects model [data, such as a database] and view [user interface], for example, handling user input. It accepts input and performs the corresponding update)

// Capital is convention for class name
const Product = require('../models/product');

exports.getProducts = (req, res) => {
  // Get products via method in Product class (in model)
  Product.fetchAll(products => {
    // res.render() is provided by Express. It will use the default templating engine (which is why it was necessary to define it in app.js) then return that template
    // Since already specified that all views are in the views folder, don't have to construct a path to to that folder
    // Don't need shop.ejs (the extension) since that engine was defined as the default templating engine
    // To inject products into template in order to use it in template ejs file, passing second argument to render method. The render method allows passing in data that should be added into the view
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getIndex = (req, res) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res) => {
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart'
  });
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
