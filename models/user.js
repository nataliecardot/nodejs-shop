const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    // findIndex() returns matching index, or -1 if no matching index
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // _id retrieved from database can be used as a string in JS, but technically isn't of type string
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      // Overwrite old cart
      { $set: { cart: updatedCart } }
    );
  }

  getCart() {
    // in users collection, cart.items array only stores product id and quantity; to dislay product data, have to enrich it with data stored in products collection. If there is a connection between two collections with a reference, have to merge manually
    const db = getDb();
    // Mapping over an array of items, where every item is a JS object, into an array of just strings, just the product IDs
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });
    // $in query operator takes array of IDs. MongoDB find() method returns cursor that holds references to all products matching one of IDs included in array
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        // Add quantity back to every product
        return products.map((p) => {
          // Due to arrow function, `this` refers to class
          // Built-in JS find() method returns value of first element in provided array that satisfies provided testing function
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    // filter() JS method creates new array with all elements that pass test implemented by provided function (like find(), but returns array with all matching items rather than first one)
    const updatedCartItems = this.cart.items.filter((i) => {
      // Return true (keep) for all items except one being deleted
      return i.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    const order = {
      items: this.cart.items,
      user: {
        _id: new ObjectId(this._id),
        name: this.name,
      },
    };
    return db
      .collection('orders')
      .insertOne(this.cart)
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  static findById(userId) {
    const db = getDb();
    return (
      db
        .collection('users')
        // findOne() is alternative to find().next() as is used in product model to use when you know that there's just one item
        .findOne({ _id: new ObjectId(userId) })
        .then((user) => {
          // console.log(user);
          return user;
        })
        .catch((err) => console.log(err))
    );
  }
}

module.exports = User;
