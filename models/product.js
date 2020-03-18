const fs = require('fs');
const path = require('path');

const p = path.join(
  // path.dirname(p) returns the directories of a file path (see https://www.w3schools.com/nodejs/met_path_dirname.asp, https://nodejs.org/api/path.html#path_path_dirname_path); just have to figure out for which file we want to get the directory name. For this, can use global `process` variable, and on it is a mainModule property that refers to the main module that started the application (in this case, the module created in app.js). Then filename can be called to find out which file that module was spun up in. In short: process.mainModule.filename returns the location of the main file running the server (responsible for the fact the application is running), and this filename is then passed to dirname to get an absolute path to that directory
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
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  // Called on a single instance of Product
  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          prod => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        // Save updated products (writeFile replaces old content)
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          // Remove item from cart
        }
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
