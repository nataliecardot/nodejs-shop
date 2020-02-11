const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', (req, res) => {
  // With this method, data is shared across requests and users; this is data inherent to our Node server as it is running (this is rarely what you want -- you normally want to fetch data for a specific request and if that happens to be the same data you show for all users that sent this request, this is fine, but sharing this data across requests and users is typically not what you want to do, because if you then edit it with user A, user B will see the updated version [maybe some personal data, or something that wouldn't have been saved to the database yet])
  console.log('shop.js', adminData.products);
  // Automatically sets appropriate Content-Type response headers field
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
