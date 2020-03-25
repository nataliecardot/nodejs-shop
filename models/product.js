const db = require('../util/database');

const Cart = require('./cart');

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
  save() {}

  static deleteById(id) {}

  static fetchAll() {
    // Return promise
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {}
};
