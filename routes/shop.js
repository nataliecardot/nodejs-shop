const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', (req, res) => {
  const products = adminData.products;
  // This is provided by Express. It will use the default templating engine (which is why it was necessary to define it in app.js) then return that template
  // Since already specified that all views are in the views folder, don't have to construct a path to to that folder
  // Don't need shop.pug (extension) since that engine was defined as the default templating engine; it will look for Pug files
  // To inject products into template in order to use it in template file shop.pug, passing second argument to render method. The render method allows to pass in data that should be added into the view
  res.render('shop', { prods: products, pageTitle: 'Shop', path: '/' });
});

module.exports = router;
