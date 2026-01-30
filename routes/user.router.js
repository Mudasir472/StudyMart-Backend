// import express from 'express';
const express = require('express')
const router = express.Router({ mergeParams: true });
const { createUser, userLogin, userLogout, validUser, changeProfile, editUser, getAllUsers, googleAuth } = require("../controllers/user.controller");
const authenticate = require('../middlewares/authenticate');

const { storage } = require("../cloudConfig");
const multer = require('multer');
const upload = multer({ storage });

// Route to create a new user
router.post('/signup', createUser);

// Route to Login the user
router.post('/login', userLogin);



// Route to Login the user
router.get('/logout', authenticate, userLogout);

// Route to Validate the user
router.get('/validuser', authenticate, validUser);

// Route to edit user
router.post("/edituser", authenticate, editUser);

router.post("/user/changeprofile", authenticate, upload.single("profilePic"), changeProfile)

router.get("/getallusers", getAllUsers);

// Google Route
router.get("/auth/google", googleAuth);

module.exports = router;