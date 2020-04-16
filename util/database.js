const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// Underscore indicates variable will only be used in this file
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://natalie:lRMEZPpEz50mgjZQ@cluster0-4yuid.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found';
};

// For connecting and storing connection to database (in _db), which keeps running
exports.mongoConnect = mongoConnect;
// Function that returns access to connected database if it exists (behind the scenes, MongoDB manages connection with connection pooling, in which it ensures that it provides sufficient connections for multiple, simultaneous interactions with database)
exports.getDb = getDb;
