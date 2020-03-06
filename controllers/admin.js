const Product = require('../models/product');

// For GET request to add-product page
// GET is used to request data from a specified resource
exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    // You can set path to whatever you want; doesn't have to match route
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

// For POST request (from form submission; form has method="POST")
// POST is used to send data to a server to create/update a resource
exports.postAddProduct = (req, res) => {
  // Create new object based on Product class (blueprint). title comes from attribute (name="title") in input
  const product = new Product(req.body.title);
  // Save product (pushes to products array)
  product.save();
  // Don't have to set status code and location header using this Express convenience method
  res.redirect('/');
};

exports.getProducts = (req, res) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};
