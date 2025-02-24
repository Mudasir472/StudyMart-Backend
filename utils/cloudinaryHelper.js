const { cloudinary } = require('../cloudConfig.js')

const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        if (!publicId) return;

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        // console.log(`Deleted ${resourceType} from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error(`Failed to delete ${resourceType} from Cloudinary:`, error);
    }
};

module.exports = { deleteFromCloudinary };
