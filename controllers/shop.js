// All product-related logic (controller connects model [data, such as a database] and view [user interface], for example, handling user input. It accepts input and performs the corresponding update)

// Capital is convention for class name
const Product = require('../models/product');

exports.getProducts = (req, res) => {
  // Get all records for this model
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res) => {
  // Extract value held by dynamic path segment in shop.js routes file
  // Express.js supplies params object. Can access productId on params object because that's the name used after the colon in the route
  const prodId = req.params.productId;
  // Note, by default findAll provides an array, even if it only has one element (as it will in this case)
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res) => {
  req.user
    .getCart()
    .then((cart) => {
      //  Cart is associated with products in app.js through belongsToMany. Sequelize looks into cartitem inbetween table
      return cart
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
  // Retrieve product ID from incoming request and fetch that product in database/file and add it to cart
  // productId is the name used in the view, on the hidden input
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
    });
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     // Find out if item is part of cart; if it is, only need to increase quantity, otherwise add with quantity of 1
  //     // Retrieve product data associated with cart for product in incoming request
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   // Will get array of products that only holds one product, or if product not already in cart, it will be empty
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     // If product isn't undefined and do have valid product, increase quantity
  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity += oldQuantity;
  //       return product;
  //     }
  //     // If product not in cart, find general data for product and add new product
  //     return Product.findByPk(prodId);
  //   })
  //   // addProduct() is another magic method added by Sequelize for many-many relationships; product will be added to inbetween table cartitems
  //   // through: telling Sequelize for inbetween table cartitems, here's additional info needed to set values; setting keys/fields that should be set in cartitems
  //   .then((product) => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     // Express method. Loads the GET route, the cart page
  //     res.redirect('/cart');
  //   })
  //   .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          // Associate products with order
          return order.addProducts(
            products.map((product) => {
              // Configure value for inbetween table orderitems (taking quantity field for each product in cart from cartitems table and storing it in orderitems table). orderItem corresponds to model name as specified with Sequelize.define()
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .then((result) => {
          // Drop items in cartitems
          return fetchedCart.setProducts(null);
        })
        .then((result) => {
          res.redirect('/orders');
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res) => {
  req.user
    .getOrders({ include: ['products'] })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch((err) => console.log(err));
};
