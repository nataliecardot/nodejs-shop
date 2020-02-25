const products = [];

// Refresher on what a class is https://www.javascripttutorial.net/es6/javascript-class/
module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  // Called on a single instance of Product
  save() {
    // `this` will refer to the object created based on the class
    products.push(this);
  }

  // Retrieve all products from array. Not called on a single instance of Product; static keyword allows for calling method directly on the class itself rather than an instantiated object
  static fetchAll() {
    return products;
  }
};
