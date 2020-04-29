const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Embedded document
  cart: {
    // To define that you want to store an array, you simply create an array
    // Array of embedded documents
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          // ref to indicate ID refers to product stored/defined through product model (refs only needed when using references)
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// Called on instance based on model (instances of models are documents), on an object which will have a populated cart with either an empty array of items or one that has items
// Function assigned to methods object of schema has to be written like this so `this` keyword refers to schema
userSchema.methods.addToCart = function (product) {
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
      // Mongoose automatically wraps in ObjectId
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  // filter() JS method creates new array with all elements that pass test implemented by provided function (like find(), but returns array with all matching items rather than first one)
  const updatedCartItems = this.cart.items.filter((i) => {
    // Return true (keep) for all items except one being deleted
    return i.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     // findIndex() returns matching index, or -1 if no matching index
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       // _id retrieved from database can be used as a string in JS, but technically isn't of type string
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db.collection('users').updateOne(
//       { _id: new ObjectId(this._id) },
//       // Overwrite old cart
//       { $set: { cart: updatedCart } }
//     );
//   }

//   getCart() {
//     // in users collection, cart.items array only stores product id and quantity; to dislay product data, have to enrich it with data stored in products collection. If there is a connection between two collections with a reference, have to merge manually
//     const db = getDb();
//     // Mapping over an array of items, where every item is a JS object, into an array of just strings, just the product IDs
//     const productIds = this.cart.items.map((i) => {
//       return i.productId;
//     });
//     // $in query operator takes array of IDs. MongoDB find() method returns cursor that holds references to all products matching one of IDs included in array
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         // Add quantity back to every product
//         return products.map((p) => {
//           // Due to arrow function, `this` refers to class
//           // Built-in JS find() method returns value of first element in provided array that satisfies provided testing function
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     // filter() JS method creates new array with all elements that pass test implemented by provided function (like find(), but returns array with all matching items rather than first one)
//     const updatedCartItems = this.cart.items.filter((i) => {
//       // Return true (keep) for all items except one being deleted
//       return i.productId.toString() !== productId.toString();
//     });
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     // Embedding documents with duplicate data, which isn't a problem if data changes since only want a snapshot of data as it was at time of order
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': new ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();
//     return (
//       db
//         .collection('users')
//         // findOne() is alternative to find().next() as is used in product model to use when you know that there's just one item
//         .findOne({ _id: new ObjectId(userId) })
//         .then((user) => {
//           // console.log(user);
//           return user;
//         })
//         .catch((err) => console.log(err))
//     );
//   }
// }

// module.exports = User;
