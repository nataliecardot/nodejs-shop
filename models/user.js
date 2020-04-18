const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  construction(username, email) {
    this.name = username;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    return (
      db
        .collection('users')
        // findOne() is alternative to find().next() as is used in product model to use when you know that there's just one item
        .findOne({ _id: new ObjectId(userId) })
    );
  }
}

module.exports = User;
