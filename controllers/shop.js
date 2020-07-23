const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const moment = require('moment');

// const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 8;

exports.getProducts = (req, res, next) => {
  // Using unary plus operator to convert to number (otherwise it's a string and is concatenated with number in logic below)
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return (
        Product.find()
          // To sort in descending order (newest at top of list)
          // .sort({ _id: -1 })
          // skip MongoDB and therefore Mongoose method skips first x amt of results and is called on a cursor. find() is an object that returns a cursor, an object that enables iterating through documents of a collection
          .skip((page - 1) * ITEMS_PER_PAGE)
          // Only fetch amt of items to display on current page
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
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

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getHomepage = (req, res, next) => {
  res.render('shop/index', {
    pageTitle: 'Home',
    path: '/',
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Currently payment process has flaw; user can enter success URL and the cart is cleared. Should use webhooks
// Can configure Stripe so it sends a request to a URL of choice (which would have to be managed wth routing) and that tells you the order succeeded, because Stripe sends the request behind the scenes. Does not send a request to a URL of your site anyone can enter, but will be a request validated by Stripe not as easy to fake. Webhooks setup in Stripe docs
exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      total = total.toFixed(2);

      // Create sessions key to use in EJS template
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            // Have to specify price in cents
            // Using Math.round to ensure that I get an integer, due to JS floating point error causing Stripe invalid integer error "'Invalid integer: 819.9999999999999'" https://stackoverflow.com/questions/28025804/stripe-checkout-price-error-invalid-integer/28067229
            amount: Math.round(p.productId.price * 100),
            currency: 'usd',
            quantity: p.quantity,
          };
        }),
        // Routes Stripe will redirect to once payment is confirmed or canceled
        // Generating dynamically so can use on local testing server and once deployed
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        date: moment().format('YYYY-MM-DD'),
        products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postOrder = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     .execPopulate()
//     .then((user) => {
//       const products = user.cart.items.map((i) => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user,
//         },
//         products,
//       });
//       return order.save();
//     })
//     .then((result) => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// TODO: Replicate behavior with S3 upload
// exports.getInvoice = (req, res, next) => {
//   const orderId = req.params.orderId;
//   Order.findById(orderId)
//     .then((order) => {
//       if (!order) {
//         return next(new Error('No order found.'));
//       }
//       if (order.user.userId.toString() !== req.user._id.toString()) {
//         return next(new Error('Unauthorized'));
//       }
//       const invoiceName = `invoice-${orderId}.pdf`;
//       // const invoicePath = path.join('data', 'invoices', invoiceName);

//       const pdfDoc = new PDFDocument();
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader(
//         'Content-Disposition',
//         'inline; filename="`${invoiceName}`"'
//       );
//       // pdfDoc is a readable stream [source from which data can be consumed]; pipe into writable stream. Also ensures generated PDF gets stored on server, not just served to client
//       pdfDoc.pipe(fs.createWriteStream(invoicePath));
//       // Return PDF to client. Pipe into response (response is a writable stream [destination to which data can be written])
//       pdfDoc.pipe(res);

//       pdfDoc.fontSize(26).text('Invoice', {
//         underline: true,
//         align: 'center',
//       });
//       let totalPrice = 0;
//       order.products.forEach((prod) => {
//         totalPrice += prod.quantity * prod.product.price;
//         pdfDoc
//           .fontSize(12)
//           .text(
//             `${prod.product.title} – ${prod.quantity} x $${prod.product.price}`
//           );
//       });
//       pdfDoc.moveDown();
//       pdfDoc.fontSize(18).text(`Total: $${totalPrice.toFixed(2)}`);

//       pdfDoc.end();

//       // S3 upload
//       const params = {
//         key: invoiceName,
//         body: './output.pdf',
//         bucket: 'nodejs-shop',
//         contentType: 'application/pdf',
//       };

//       s3.putObject(params, function (err, response) {});
//     })
//     .catch((err) => next(err));
// };
