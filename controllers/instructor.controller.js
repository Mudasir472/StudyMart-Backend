const bcrypt = require('bcrypt')
const Instructor = require("../modals/instructor.modal.js");
const { BAD_REQUEST, NOT_FOUND, OK, INTERNAL_SERVER_ERROR } = require('../utils/httpCodeStatus.js');

module.exports.createTeacher = async (req, res) => {
    try {
        const {
            firstname, lastname, username, email, password, phone, expertise,
            profileImage, address, city, pincode, country, aboutInfo, github,
            role, courses
        } = req.body;
        // Check if all required fields are provided
        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(BAD_REQUEST).json({ msg: "All required fields must be provided." });
        }

        // Check if the instructor already exists
        const existingInstructor = await Instructor.findOne({ email });
        if (existingInstructor) {
            return res.status(400).json({ msg: "Instructor with this email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new instructor
        const newInstructor = new Instructor({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword, // Ideally hashed before saving
            phone,
            expertise,
            profileImage,
            address,
            city,
            pincode,
            country,
            aboutInfo,
            github,
            role: role || "instructor", // Default role is "instructor"
            courses: courses || [] // Default to an empty array if not provided
        });

        await newInstructor.save();

        // Respond with success
        res.status(OK).json({
            msg: "Instructor created successfully.",
            instructor: newInstructor
        });
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error." });
    }
};

module.exports.InstructorDetails = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(NOT_FOUND).json({
                success: false,
                message: "Not found",
            });
        }

        const teacher = await Instructor.findById(req.user._id);

        if (!teacher) {
            return res.status(NOT_FOUND).json({
                success: false,
                message: "Instructor not found.",
            });
        }

        res.status(OK).json({
            success: true,
            message: "Instructor details retrieved successfully.",
            teacher,
        });
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while retrieving the instructor details.",
        });
    }
};

module.exports.UpdateInstructor = async (req, res) => {
    try {
        const { firstname, lastname, username, email, phone, expertise,
            profileImage, address, city, pincode, country, aboutInfo, github,
        } = req.body;
        // Check if user ID exists
        if (!req.user || !req.user._id) {
            return res.status(BAD_REQUEST).json({
                success: false,
                message: "User ID is required for updating details.",
            });
        }
        const updatedTeacher = await Instructor.findByIdAndUpdate(
            req.user._id,
            {
                firstname, lastname, username, email, phone, expertise,
                profileImage, address, city, pincode, country, aboutInfo, github,
            },
            { new: true }
        );
        if (!updatedTeacher) {
            return res.status(NOT_FOUND).json({
                success: false,
                message: "Teacher not found.",
            });
        }
        res.status(OK).json({
            success: true,
            message: "Teacher details updated successfully.",
            teacher: updatedTeacher,
        });
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while updating the teacher details.",
        });
    }
}