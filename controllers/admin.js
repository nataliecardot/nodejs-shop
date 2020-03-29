const Product = require('../models/product');

// For GET request to add-product page
exports.getAddProduct = (req, res) => {
  // res.render renders a view template, optionally passing 'locals' object that contains properties that define local variables for the view
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
  // Create creates a new element based on model and immediately saves it to database (build also creates a new object based on model, but only in JS, then it must be saved manually). Takes args per model definition (using destructuring)
  Product.create({
    title,
    price,
    imageUrl,
    description
  })
    .then(result => {
      // console.log(result)
      console.log('Product created');
    })
    .catch(err => console.log(err));
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
  // Fetch info for the product and create new Product instance and populate it with that info then call Product.save()
  // using productId because that's the name given to the hidden input in the edit-product.ejs view file
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedPrice,
    updatedDesc
  );
  updatedProduct.save();
  // Will put this in a callback later to ensure it's only executed after new data is saved
  res.redirect('/admin/products');
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

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId);
  // Will put this in a callback later to ensure it's only executed after deletion
  res.redirect('/admin/products');
};
