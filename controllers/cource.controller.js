const Course = require('../modals/cource.model.js');
const Cource = require('../modals/cource.model.js');
const User = require('../modals/user.modal.js');
const Payment = require("../modals/payment.modal.js");
const {deleteFromCloudinary} = require('../utils/cloudinaryHelper.js')
const mongoose = require('mongoose')
const { OK, NOT_FOUND, INTERNAL_SERVER_ERROR, CONFLICT, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED } = require('../utils/httpCodeStatus.js');

module.exports.getCource = async (req, res) => {
    try {
        // const courses = await Course.find({});
        const courses = await Course.find().sort({ createdAt: -1 }).populate({
            path: 'reviews',
            populate: {
                path: 'author',
                select: 'firstname image',
            }
        }).populate("instructorId")

        res.status(OK).json({
            success: true,
            message: "Courses retrieved successfully",
            Allcources: courses
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while fetching courses",
            error: error.message
        })
    }
}

module.exports.enrollCource = async (req, res) => {
    const { courseId, formData } = req.body;
    const userId = req.user._id;
    const cource = await Cource.findById(courseId)
    const instructorId = cource.instructorId;

    try {
        // Find the user and course
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(NOT_FOUND).json({ message: "Course not found" });
        }
        // Check if the user is already enrolled
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(CONFLICT).json({ message: "You are already enrolled in this course" });
        }
        // Check if the user is already enrolled
        if (user.role === 'Teacher') {
            return res.status(FORBIDDEN).json({ message: "You are the Teacher , Can`t buy it" });
        }
        // Check if the course is free
        if (course.price === 0) {
            // Enroll the user directly
            user.enrolledCourses.push(courseId);
            await user.save();
            course.enrolled.push(userId);
            await course.save();
            return res.status(OK).json({ message: "Successfully enrolled in the free course", userId });
        } else {
            // For paid courses, ensure payment is processed
            if (!formData?.paymentMethod) {
                return res.status(BAD_REQUEST).json({ message: "Payment details are required for paid courses" });
            }
            // Create a payment record
            const payment = new Payment({
                userId,
                courseId,
                amount: course?.price,
                instructorId: instructorId,
                paymentMethod: formData?.paymentMethod,
                status: "success", // Set this dynamically based on the payment gateway response
            });
            // payment.instructorId.push
            await payment.save();

            // Enroll the user after successful payment
            user.enrolledCourses.push(courseId);
            await user.save();
            course.enrolled.push(userId);
            await course.save();
            return res.status(OK).json({ message: "Successfully enrolled in the paid course", user });
        }
    } catch (error) {
        console.error("Error enrolling in the course:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
};

module.exports.createCource = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(BAD_REQUEST).send({ error: "No files uploaded" });
        }
        // const { images, videos } = req.files; // Assuming Multer is configured to handle both image and video uploads
        const instructor = await User.findById(req.user._id);

        if (!instructor) {
            return res.status(UNAUTHORIZED).json({ error: "Teacher not found" });
        }

        // Destructure data from the request body
        const { title, description, price, category } = req.body;
        const { images } = req.files;


        // Handle images and videos paths
        const imgpath = images.map((img) => {

            return {
                url: img.path,
                filename: img.originalname,
                public_id: img.filename
            };
        });

        const newCourse = new Course({
            title,
            description,
            price,
            category,
            images: imgpath,
            instructorId: instructor._id,
        });

        await newCourse.save();
        instructor.courses.push(newCourse._id);

        await instructor.save();

        // Return a success response
        res.status(OK).json({
            success: true,
            message: "Course created successfully",
            newCourse,
        });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
};

module.exports.deleteCource = async (req, res) => {
    try {
        const { courseId } = req.params;

        const deletedCource = await Cource.findByIdAndDelete(courseId);
        if (!deletedCource) {
            return res.status(NOT_FOUND).json({ message: "Cource not found" });
        }

        res.status(OK).json({ message: "Cource deleted successfully", deletedCource });
    } catch (error) {
        console.error("Error deleting Cource:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error", message: error.message });
    }
};

module.exports.getVideos = async (req, res) => {
    try {
        const { courseId } = req.params;
        const currUserId = req.user._id;
        if (!currUserId.enrollCourses == courseId) {
            return res.status(NOT_FOUND).json({ message: "Cource Not Found" });
        }
        const course = await Course.findById(courseId);
        if (!course) return res.status(NOT_FOUND).json({ message: "Course not found" });
        res.status(OK).json({ videos: course.videos });
    } catch (error) {
        console.log(error);

        res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch videos" });
    }
}
module.exports.deleteVideo = async (req, res) => {
    try {
        const { courseId, videoId } = req.params;
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        // Find the video to delete
        const video = course.videos.find((v) => v._id.toString() === videoId);
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }
        // Delete from Cloudinary
        await deleteFromCloudinary(video.public_id, "video");

        // Find the course and update the videos array
        await Course.findByIdAndUpdate(courseId, {
            $pull: { videos: { _id: videoId } },
        });
        res.status(OK).json({ message: 'Video removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while removing the video.' });
    }
}
// Example backend route
module.exports.deleteImages = async (req, res) => {
    const { courseId, imageId } = req.params;

    try {
        // Find the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Find the image to delete
        const image = course.images.find((img) => img._id.toString() === imageId);

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        // Delete from Cloudinary
        await deleteFromCloudinary(image.public_id, "image");

        // Remove the image from the course's image array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $pull: { images: { _id: imageId } } },
            { new: true }
        );
        res.status(OK).json({ message: 'Image removed successfully', updatedCourse });
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to remove image' });
    }
};


module.exports.updateCource = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, price, category } = req.body;

        // Find the existing course
        const existingCourse = await Cource.findById(courseId);

        if (!existingCourse) {
            return res.status(NOT_FOUND).json({ message: "Course not found" });
        }

        // Initialize variables
        let videoPath = existingCourse.videos || [];
        let imagePath = existingCourse.images || [];
        // Handle new videos
        if (req.files && req.files.videos) {
            const newVideos = req.files.videos.map((vid) => ({
                videoPath: vid.path,
                title: vid.originalname.substring(0, 28),
                public_id: vid.filename
            }));

            videoPath = [...videoPath, ...newVideos]; // Append new videos to existing ones
        }

        // Handle new images
        if (req.files && req.files.images) {
            const newImages = req.files.images.map((img) => ({
                url: img.path,
                filename: img.originalname,
                public_id: img.filename
            }));

            imagePath = [...imagePath, ...newImages]; // Append new images to existing ones
        }
        const updatedCource = await Cource.findByIdAndUpdate(courseId, {
            title,
            description,
            price,
            category,
            videos: videoPath,
            images: imagePath,
        }, { new: true })
        if (!updatedCource) {
            return res.status(NOT_FOUND).json({ message: "Course not found" });
        }
        res.status(OK).json({ message: "Course updated successfully", updatedCource });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

// Get courses for a specific instructor with enrollment count
module.exports.getSelectedCources = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // Convert userId to ObjectId
        const instructorId = new mongoose.Types.ObjectId(userId);

        // Find courses where the instructorId matches the given userId
        const courses = await Course.find({ instructorId })
            .select("category enrolled") // Get only necessary fields
            .lean(); // Convert to plain JS object

        // Format data to include enroll count
        const formattedCourses = courses.map(course => ({
            name: course.category,
            enrollCount: course.enrolled.length, // Number of enrolled students
        }));
        res.status(OK).json(formattedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};
