// Provides access to connection pool
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
  save() {
    // id generated automatically by database engine; don't need to include it
    // Using approach of question marks, one for each field inserting data into, to safety insert values and not face issue of SQL injection, an attack pattern in which users can insert special data into webpage input fields that run as SQL queries. Passing second arg to execute with values that will be injected in place of question marks. MySQL package will safely escape the input values to parse them for hidden SQL commands and remove them
    return db.execute(
      'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    // Return promise
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {}
};
