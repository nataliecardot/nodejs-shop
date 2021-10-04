const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // filename part of AWS S3 URL to pass to method that deletes it from bucket
  imageKey: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    // Tells Mongoose which other model is related to data in this field
    ref: 'User',
    required: true,
  },
});

// Model name is used as collection name in pluralized, lowercase format
module.exports = mongoose.model('Product', productSchema);
