const fs = require('fs');

const deleteFile = (filePath) => {
  // Deletes file at provided path
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
