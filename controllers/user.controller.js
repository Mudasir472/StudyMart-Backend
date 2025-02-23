const User = require("../modals/user.modal");
const bcrypt = require("bcrypt");
const axios = require('axios');
const jwt = require('jsonwebtoken');

const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED, CONFLICT } = require("../utils/httpCodeStatus");
const { oauth2Client } = require("../utils/googleClient");

module.exports.createUser = async (req, res) => {
    const { fullname, email, number, password, role, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(BAD_REQUEST).json({ error: "Passwords do not match" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(CONFLICT).json({ error: "Email Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullname,
            email,
            role,
            number,
            password: hashedPassword,
        });

        await newUser.save();

        // Create token and set cookie

        const token = await newUser.generateAuthToken();  //defined in user modal
        // Create token and set cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true,
            sameSite: 'none', // For cross-origin cookies
            secure: process.env.NODE_ENV === 'production'
        });

        // Return token and user data in the response
        const result = {
            user: newUser,
            token,
        };

        res.status(OK).json({ message: "User created successfully", result });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports.userLogin = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(UNAUTHORIZED).json({ error: "Invalid Crediantials" });
        }
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(UNAUTHORIZED).json({ error: "Invalid credentials" });
        }
        const token = await existingUser.generateAuthToken();  //defined in user modal

        // Create token and set cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true
        });

        const result = {
            existingUser,
            token
        }

        res.status(OK).json({ message: "Login successful", result });
    } catch (error) {
        console.log(error)
        res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}
module.exports.userLogout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currToken) => {
            return currToken.token !== req.token;
        });
        res.clearCookie('jwt', { path: "/" });
        await req.user.save();
        res.status(OK).json({ message: "Logout Successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports.validUser = async (req, res) => {
    try {
        const validuser = await User.findOne({ _id: req.user._id })
        res.status(OK).json({ success: true, validuser });

    } catch (error) {
        res.status(UNAUTHORIZED).json({ error: "Not a valid user" });
    }
}

module.exports.changeProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(BAD_REQUEST).send({ message: "No file uploaded" });
        }

        // Assuming req.user contains the logged-in user's information
        const userId = req.user._id;
        const filePath = req.file.path; // Path to the uploaded file

        // Update the user's profile picture in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 'image.url': filePath }, // Update the image URL field; adjust field as per your schema
            { new: true } // Return the updated document
        );

        res.status(OK).json({ message: "Profile picture updated successfully!", user: updatedUser });
    } catch (error) {
        console.error('Error uploading the file:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Failed to update profile picture", error: error.message });
    }
};

module.exports.editUser = async (req, res) => {
    const { fullname, biography, address, city, country, skills, facebookLink, instaLink, linkedinLink, githubLink } = req.body;
    const userId = req.user?._id;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullname,
                biography,
                address,
                city,
                country,
                skills,
                facebookLink,
                instaLink,
                linkedinLink,
                githubLink,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(NOT_FOUND).json({ message: "User not found." });
        }
        res.status(OK).json({ message: "User updated Successfully", updatedUser });

    } catch (error) {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).json({ err: error, message: "An error occurred while updating the user." });
    }

}

module.exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({});
        res.status(OK).json({
            message: "Fetched All users",
            allUsers,
            success: true
        })

    } catch (error) {
        console.log(error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message, success: false })
    }
}

// For Google Auth
/* GET Google Authentication API. */
module.exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    // console.log(code);
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture } = userRes.data;
        // console.log(userRes);
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                fullname: name,
                email,
                image: {
                    imgName: "Profile Picture", // You can use a default or dynamic value
                    url: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
                },
            });
        }
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.MY_SECRET, {
            expiresIn: '5d'
        });
        res.status(200).json({
            message: 'success',
            token,
            user,
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};