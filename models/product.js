const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = new mongodb.ObjectId(id);
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      // Update product
      dbOp = db
        .collection('products')
        // Second arg is description of changes to make to existing document found with filter. Using `this` instructs MongoDB to set key-value fields present in object/product instance to document in database (you could also do {title: this.title}, and so on, but this can be used since want to update all fields, except ID, which won't be overwritten)
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
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

  static findById(prodId) {
    const db = getDb();
    // find() still returns a cursor here since MongoDB doesn't know will only get one product; using next() to get next, and this case last, document returned by find()
    return (
      db
        .collection('products')
        // MongoDB stores IDs as ObjectID. MongoDB stores data in BSON format, which allows use of ObjectId, a type added by MongoDB (not a default JS type). It generates and manages ID, which look random but actually aren't
        .find({ _id: new mongodb.ObjectId(prodId) })
        .next()
        .then((product) => {
          console.log(product);
          return product;
        })
        .catch((err) => console.log(err))
    );
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => {
        console.log('Deleted');
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
