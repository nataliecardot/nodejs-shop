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
