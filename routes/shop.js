const path = require('path');

const express = require('express');

const router = express.Router();

// Using get so that the order doesn't matter in app.js (then it's an exact match, unlike with router.use [same for app.use])
router.get('/', (req, res) => {
  // Automatically sets appropriate Content-Type response headers field
  // Shop.js is impoted into app.js, which is in root folder. To link it, have to use absolute path, but can't start with a slash (/views/shop.html); the leading forward slash would refer to root folder on operating system; must use Node.js path module (and join method) to get absolute path on operating system. Join returns a path in the end, but it constructs the path by concatenating the different segments. The first segment we should pass is a global variable made available by Node.js, underscore underscore dirname. It is a global variable which simply holds the absolute path on our operating system to this project folder. Not adding slashes because using path.join. We use path.join not because of the absolute path -- we could build the path with __dirname then concatenate views and shop.html manually, but using path.join because after detecting the operating system you're working on, it automatically builds the path in a way that works on either Windows or Linux system (Linux has forward slashes, Windows has backslashes; if you manually construct with slashes, it would not run on Windows, and vice versa)
  // __dirname gives path to file in which we would use it, which is routes folder, but views folder is a sibling to routes; solution is adding one more segment, '../'
  res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
});

module.exports = router;
