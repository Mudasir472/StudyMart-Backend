require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        let resourceType = "raw"; // default for pdf, ppt, doc, etc.

        if (file.mimetype.startsWith("image/")) resourceType = "image";
        if (file.mimetype.startsWith("video/")) resourceType = "video";
        const ext = path.extname(file.originalname).replace(".", "");
        console.log("ext", ext);

        const baseName = path.basename(file.originalname, path.extname(file.originalname));
        console.log("baseName", baseName);
        return {
            folder: "StudyMart",
            allowed_formats: [
                "png",
                "jpg",
                "jpeg",
                "mp4",
                "pdf",
                "ppt",
                "pptx",
                "doc",
                "docx",
            ],
            resource_type: resourceType,
            public_id: `${Date.now()}-${baseName}.${ext}`
        };
    },
});

module.exports = {
    cloudinary,
    storage,
};
