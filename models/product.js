const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    // As with database, if doesn't exist yet, will be created upon inserting data
    return db
      .collection('products')
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return (
      db
        .collection('products')
        // find() returns a cursor, an object provided by MongoDB that allows for iterating over documents matching query
        .find()
        // toArray to get all documents and turn them into a JavaScript array, but only should be used if have up to 100 or so documents; otherwise better to implement pagination
        .toArray()
        .then((products) => {
          console.log(products);
          return products;
        })
        .catch((err) => console.log(err))
    );
  }
}

module.exports = Product;
