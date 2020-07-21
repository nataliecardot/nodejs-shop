const aws = require('aws-sdk');
// const fs = require('fs');

const deleteFile = (key) => {
  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2',
  });

  s3.deleteObject(
    {
      Bucket: 'nodejs-shop',
      Key: key,
    },
    function (err, data) {
      // console.log('Image deleted');
      if (err) {
        throw err;
      }
    }
  );
};

// const deleteFile = (filePath) => {
//   // Deletes file at provided path
//   fs.unlink(filePath, (err) => {
//     if (err) {
//       throw err;
//     }
//   });
// };

exports.deleteFile = deleteFile;
