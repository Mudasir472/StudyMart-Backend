const { model } = require("mongoose");
const Course = require("../modals/cource.model");
const User = require("../modals/user.modal");
const mongoose = require("mongoose");
const { NOT_FOUND, UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR } = require("../utils/httpCodeStatus");
const isCourceOwner = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const cource = await Course.findById(courseId);
        if (!cource) {
            return res.status(NOT_FOUND).json({ message: "Course not found" });
        }
        const teacher = await User.findById(req.user?._id);
        if (!teacher) {
            return res.status(UNAUTHORIZED).json({ message: "Instructor not found" });
        }
        if (cource.instructorId.toString() !== teacher._id.toString()) {
            return res.status(FORBIDDEN).json({ message: "You are not Instructor" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}
module.exports = isCourceOwner;