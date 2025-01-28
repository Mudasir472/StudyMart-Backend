const express = require("express");
const { InstructorDetails, UpdateInstructor, createTeacher } = require("../controllers/instructor.controller");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middlewares/authenticate.js")


router.post("/createInstructor", createTeacher);
router.post("/instructorDetails", authenticate, InstructorDetails);
router.post("/updateInstructor", UpdateInstructor);

module.exports = router;