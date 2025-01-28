const mongoose = require("mongoose");
const instructorSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        expertise: {
            type: String,
            required: false,
        },
        profileImage: {
            imgName: String,
            url: {
                default: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
                type: String,
            }
        },

        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        pincode: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },

        aboutInfo: {
            type: String,
            required: false,
        },

        github: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            required: true,
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Cource"
            }
        ],

    },
    { timestamps: true }
);

module.exports = mongoose.model("Instructor", instructorSchema);