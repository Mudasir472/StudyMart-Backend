require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
// console.log('Cloudinary Config:', {         //verify keys from .env
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // You can dynamically set folder and allowedFormats based on the file type, if needed
        return {
            folder: 'StudyMart',
            allowed_formats: ['png', 'jpg', 'jpeg', 'mp4'], // Correct key here
            resource_type: file.mimetype.startsWith('video') ? 'video' : 'image', 
        };
    }
});
module.exports = {
    cloudinary,
    storage
}