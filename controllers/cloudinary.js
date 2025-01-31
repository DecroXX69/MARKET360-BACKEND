// // services/cloudinary.js
// const cloudinary = require('cloudinary').v2;
// const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadImage = async (file) => {
//   return new Promise((resolve, reject) => {
//     const upload = cloudinary.uploader.upload_stream(
//       { folder: 'products', resource_type: 'image' },
//       (error, result) => {
//         if (error) reject(error);
//         resolve({ url: result.secure_url, public_id: result.public_id });
//       }
//     );

//     file.stream.pipe(upload);
//   });
// };

// module.exports = { uploadImage };



const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { 
        folder: 'products',  // Folder where images will be stored
        resource_type: 'image',  // Type of resource (image)
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      }
    );

    // Pipe the file stream to Cloudinary
    file.stream.pipe(upload);
  });
};

module.exports = { uploadImage };
