const Product = require('../models/product');

// For GET request to add-product page
exports.getAddProduct = (req, res) => {
  // res.render renders a view template, optionally passing 'locals' object that contains properties that define local variables for the view
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    // You can set path to whatever you want; doesn't have to match route
    path: '/admin/add-product',
    editing: false,
  });
};

// For POST request (from form submission; form has method="POST")
exports.postAddProduct = (req, res) => {
  // Create new object based on Product class (blueprint). title, etc., comes from attribute (name="title") in input
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // Map values to fields defined in schema (order doesn't matter since it's in a JS object). Creates new product based on model, which is based on the schema
  const product = new Product({ title, price, description, imageUrl });
  product
    // Mongoose method
    .save()
    // Technically you don't get a promise, but Mongoose provides then method
    .then((result) => {
      console.log('Product created');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
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
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        // You can set path to whatever you want; doesn't have to match route
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
  // Fetch info for the product and create new Product instance and populate it with that info then call Product.save()
  // using productId because that's the name given to the hidden input in the edit-product.ejs view file
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then((product) => {
      // Thanks to Mongoose, this will not only be JS object with the product data, but a full Mongoose methon on which Mongoose methods like save() can be called. If save() called on existing object, not saved as new one, but an update is done
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save();
    })
    // Technically you don't get a promise, but Mongoose provides then method
    .then((result) => {
      console.log('Product updated');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  // findByIdAndRemove is a Mongoose method that removes a document
  Product.findByIdAndRemove(prodId)
    // This will execute once destruction succeeded
    .then(() => {
      console.log('Product destroyed');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
  // Will put this in a callback later to ensure it's only executed after deletion
};
