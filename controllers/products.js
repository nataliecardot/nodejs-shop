// All product-related logic (controller connects model [data, such as a database] and view [user interface], for example, handling user input. It accepts input and performs the corresponding update)

const products = [];

// For GET request to add-product page
// GET is used to request data from a specified resource
exports.getAddProduct = (req, res) => {
  res.render('add-product', {
    pageTitle: 'Add Product',
    // You can set path to whatever you want; doesn't have to match route
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

// For POST request
// POST is used to send data to a server to create/update a resource
exports.postAddProduct = (req, res) => {
  // Get body of incoming request with body property provided by Express
  // By default, request doesn't try to parse incoming request body. To do that, have to register a parser by adding another middleware (done above)
  // Once parser is registered, yields JavaScript object with key-value pair
  products.push({ title: req.body.title });
  // Don't have to set status code and location header using this Express convenience method
  res.redirect('/');
};

exports.getProducts = (req, res) => {
  // This is provided by Express. It will use the default templating engine (which is why it was necessary to define it in app.js) then return that template
  // Since already specified that all views are in the views folder, don't have to construct a path to to that folder
  // Don't need shop.pug (extension) since that engine was defined as the default templating engine; it will look for Pug files
  // To inject products into template in order to use it in template file shop.pug, passing second argument to render method. The render method allows to pass in data that should be added into the view
  res.render('shop', {
    prods: products,
    pageTitle: 'Shop',
    path: '/',
    // Doing it here because you can't run any logic in Handlebars template; can only output single variables and their value, and can only use these in if blocks, too
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true
  });
};
