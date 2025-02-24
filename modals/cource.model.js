const Review = require("../modals/review.modal")

const mongoose = require("mongoose");
const User = require("./user.modal");
const Payment = require("./payment.modal");
const { cloudinary } = require("../cloudConfig");
const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        videos: [
            {
                title: { type: String, required: true },
                videoPath: { type: String, required: true },
                public_id: { type: String, required: true }
            },
        ],

        images: [{
            filename: { type: String, },
            url: {
                type: String,
                set: (v) =>
                    v === ""
                        ? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                        : v,
            },
            public_id: { type: String, required: true }
        }],
        category: {
            type: String,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        enrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false,
            }
        ],


        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
                required: false,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// delete middleware => when cource delete , all reviews should be deleted
courseSchema.post("findOneAndDelete", async (cource) => {

    if (cource) {
        await Review.deleteMany({ _id: { $in: cource.reviews } })
        // Remove the course from enrolled users
        await User.updateMany(
            { _id: { $in: cource.enrolled } },
            { $pull: { enrolledCourses: cource._id } }
        );

        await User.findByIdAndUpdate(cource.instructorId, {
            $pull: { courses: cource._id }
        });
        // **Delete Videos from Cloudinary**
        if (cource.videos && cource.videos.length > 0) {
            for (let video of cource.videos) {
                if (video.public_id) {
                    await cloudinary.uploader.destroy(video.public_id, {
                        resource_type: 'video'
                    });
                }
            }
        }
        // **Delete Images from Cloudinary of this cource**
        if (cource.images && cource.images.length > 0) {
            for (let image of cource.images) {
                if (image.public_id) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }
    }
});

// Middleware to delete payments when a course is deleted
courseSchema.pre("findOneAndDelete", async function (next) {
    const courseId = this.getFilter()._id;
    await Payment.deleteMany({ courseId });
    next();
});
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
