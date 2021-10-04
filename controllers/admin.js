const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-edit-form', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;

  // If not set, multer declined incoming file
  if (!image) {
    return res.status(422).render('admin/add-edit-form', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage:
        'File type not supported. Please upload a JPEG, JPG, or PNG image file.',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render('admin/add-edit-form', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = req.file.location;
  // console.log(imageUrl);
  const imageKey = req.file.key;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    imageKey,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      // When next is called with error passed as arg, informs Express that an error occurred, and Express will skip to error-handling middleware
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/add-edit-form', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-edit-form', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        const imageUrl = req.file.location;
        const imageKey = req.file.key;
        fileHelper.deleteFile(product.imageKey);
        product.imageUrl = imageUrl;
        product.imageKey = imageKey;
      }
      return product.save().then((result) => {
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const ITEMS_PER_PAGE = 8;

  const page = +req.query.page || 1;
  let totalItems;

  Product.find({ userId: req.user._id })
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return (
        Product.find({ userId: req.user._id })
          // Skip MongoDB and therefore Mongoose method skips first x amt of results and is called on a cursor. find() is an object that returns a cursor, an object that enables iterating through documents of a collection
          .skip((page - 1) * ITEMS_PER_PAGE)
          // Only fetch amt of items to display on current page
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      // Delete image file for product stored on server
      fileHelper.deleteFile(product.imageKey);

      // Delete product from every user's cart
      User.find({}, (err, users) => {
        users.forEach((user) => {
          user.removeFromCart(prodId);
        });
      });
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      // json() is an Express helper method for returning JSON data (can use normal JS object; will be converted to JSON behind the scenes)
      res.status(200).json({ message: 'Success!' });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Deleting product failed.' });
    });
};
