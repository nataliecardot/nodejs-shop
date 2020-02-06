const express = require('express');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>');
});

module.exports = router;
