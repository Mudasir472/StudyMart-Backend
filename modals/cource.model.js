const Review = require("../modals/review.modal")

const mongoose = require("mongoose");
const User = require("./user.modal");
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
            }
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
    }
})
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
