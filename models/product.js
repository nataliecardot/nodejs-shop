const fs = require('fs');
const path = require('path');

// Helper function that will construct path and read file
// Passing callback as arg (the callback is passed in in controllers/products.js) to address issue of readFile being asynchronous and getProductsFromFile() completing before its callback is done executing, and thus products.length being undefined
const getProductsFromFile = cb => {
  const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
  );
  // readFile method is asynchronous; once this line is executed, the callback is registered in event emitter registry and getProductsFromFile() finishes; the function itself doesn't return anything (and therefore undefined, the default return value for functions). Callback is executed once file at specified path is done being read
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      // No products. Have to still return an empty array (expected value in controller; used to check length property)
      return cb([]);
    }
    // Don't need else because a return would cause function to finish executing
    // To pass file content as an array instead of a JSON string (text), necessary to call parse method
    cb(JSON.parse(fileContent));
  });
};

// Refresher on what a class is https://www.javascripttutorial.net/es6/javascript-class/
module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  // Called on a single instance of Product
  save() {
    const p = path.join(
      path.dirname(process.mainModule.filename),
      'data',
      'products.json'
    );
    // To store new product, first get existing array of products
    fs.readFile(p, (err, fileContent) => {
      // Needed for when no products.json file; no products added (in this case there will be an error, but this line is executed regardless)
      let products = [];
      if (!err) {
        // No error means there is a products.json ('p' variable path) already; will store newly added product inside (but first get existing file content, array of products, so it can be appended to the end)
        // JSON is vanilla Node.js helper object
        // parse method takes incoming JSON and returns a JavaScript array, object, or whatever is in the file (it will be an array since initially products is set to equal an empty array, the first item is pushed, and the file is created, holding the array in the form of a JSON string)
        products = JSON.parse(fileContent);
      }
      // So, products will be an array, either the one read from the file or an empty one; can now append new product to it
      // Arrow function needed to ensure the `this` keyword refers to the class; otherwise loses context
      products.push(this);
      // stringify method takes JavaScript object or array and converts it into JSON string
      // writeFile replaces file if file already exists; would be replacing with existing content with new item appended
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  // Retrieve all products from array. Not called on a single instance of Product; static keyword allows for calling method directly on the class itself rather than an instantiated object
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
