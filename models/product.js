const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

// Passing callback as arg (the callback is passed in in controllers/shop.js) to address issue of readFile being asynchronous and getProductsFromFile() completing before its callback is done executing, and thus products.length being undefined
const getProductsFromFile = cb => {
  // readFile method is asynchronous; once this line is executed, the callback is registered in event emitter registry and getProductsFromFile() finishes; the function itself doesn't return anything (and therefore undefined, the default return value for functions). Callback is executed once file at specified path is done being read
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      // No products. Have to still return an empty array (expected value in controller; used to check length property)
      return cb([]);
    }
    // Don't need else because the return within the if statement would cause function to finish executing
    // To pass file content as an array instead of a JSON string (text), necessary to call parse method
    cb(JSON.parse(fileContent));
  });
};

// Refresher on what a class is https://www.javascripttutorial.net/es6/javascript-class/
module.exports = class Product {
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  // Called on a single instance of Product
  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  // Retrieve all products from array. Not called on a single instance of Product; static keyword allows for calling method directly on the class itself rather than an instantiated object
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    });
  }
};
