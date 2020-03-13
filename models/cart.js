const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        // Cart exists
        cart = JSON.parse(fileContent);
      }
      // Analyze cart => see if product is already in cart
      const existingProductIndex = cart.products.findIndex(
        prod => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        // Take all properties of existing product and add them to a new JS object (using ES6 spread operator)
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      // The + before productPrice is a unary operator, used to convert it from string to number. It's stored as a string in product model; data is converted to a string as a product of sending it from client to server (although the form input for the price has a type number, for built-in validation to reject non-numerical entries and usage of stepper arrows to increase/decrease value)
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
    // Add new product or increase quantity
  }
};
