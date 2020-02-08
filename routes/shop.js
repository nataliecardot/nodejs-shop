const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', (req, res) => {
  // Automatically sets appropriate Content-Type response headers field
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
