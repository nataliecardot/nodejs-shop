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
  // Token will only be present if requested to reset password
  resetToken: String,
  resetTokenExpiration: Date,
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
