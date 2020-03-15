const Product = require('../models/product');

// For GET request to add-product page
exports.getAddProduct = (req, res) => {
  // res.render renders a view template, optionally passing locals, an object whose properties define local variables for the view
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    // You can set path to whatever you want; doesn't have to match route
    path: '/admin/add-product',
    editing: false
  });
};

// For POST request (from form submission; form has method="POST")
exports.postAddProduct = (req, res) => {
  // Create new object based on Product class (blueprint). title, etc., comes from attribute (name="title") in input
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, imageUrl, price, description);
  // Save product (pushes to products array)
  product.save();
  // Don't have to set status code and location header using this Express convenience method
  res.redirect('/');
};

// Like getAddProduct, except here, will pass in the product information, and upon hitting save, want to edit rather than create product
exports.getEditProduct = (req, res) => {
  // Query object is created and managed by Express
  // If edit param isn't set, will get undefined (falsy)
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  // id can be retrieved from incoming request because it's part of dynamic segment in route (/admin/edit-product/:productID, GET)
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      // You can set path to whatever you want; doesn't have to match route
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  });
};

exports.postEditProduct = (req, res) => {
  // Contruct new product and replace previously existing one with the new one
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
