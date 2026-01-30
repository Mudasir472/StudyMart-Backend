const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["pdf", "ppt"],
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        public_id: {
            type: String,
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
