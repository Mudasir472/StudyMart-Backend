const express = require("express");
const router = express.Router({ mergeParams: true });
const StudyMaterial = require("../modals/studyMaterial.modal");
const Course = require("../modals/cource.model.js");
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage }); // pdf,ppt allowed
const authenticate = require("../middlewares/authenticate");
const { deleteFromCloudinary } = require("../utils/cloudinaryHelper.js");
const isCourceOwner = require("../middlewares/isCourceOwner.js");
const User = require("../modals/user.modal.js");

router.post(
    "/upload/",
    authenticate,
    upload.single("file"),
    async (req, res) => {
        try {
            const { title, type, courseId } = req.body;
            if (!title || !type || !courseId || !req.file) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            if (course.instructorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "You are not the course instructor" });
            }

            const user = await User.findById(req.user._id);
            const material = await StudyMaterial.create({
                title,
                type,
                uploadedBy: req.user._id,
                courseId: courseId,
                fileUrl: req.file.path,                    // download URL
                previewUrl: req.file.path.replace(
                    "/raw/upload/",
                    "/image/upload/"
                ),
                public_id: req.file.filename,
            });
            user.materialUploads.push(material._id);
            await user.save();
            res.status(201).json(material);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    }
);

router.get("/:courseId", authenticate, async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course)
            return res.status(404).json({ message: "Course not found" });
        // const isInstructor =
        //     course.instructorId.toString() === req.user._id.toString();
        const isEnrolled = course.enrolled.includes(req.user._id);

        if (!isEnrolled) {
            return res.status(403).json({ message: "Access denied" });
        }

        const materials = await StudyMaterial.find({ courseId }).sort({
            createdAt: -1,
        }).populate("uploadedBy", "fullname email");

        res.status(200).json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get materials By teacher
router.get("/material/teacher", authenticate, async (req, res) => {
    try {
        const teacherId = req.user?._id;
        if (!teacherId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const teacher = await User.findById(teacherId).populate("materialUploads");
        res.json(teacher.materialUploads);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", authenticate, async (req, res) => {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Not found" });

    const course = await Course.findById(material.courseId);

    if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    // // delete from cloudinary
    // await cloudinary.uploader.destroy(material.public_id, {
    //     resource_type: "raw",
    // });
    await deleteFromCloudinary(material.public_id, "raw");
    await material.deleteOne();
    res.json({ message: "Material deleted" });
});

module.exports = router;
