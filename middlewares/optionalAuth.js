const jwt = require("jsonwebtoken");
const User = require('../modals/user.modal');

const key = "MySecretOkDontTouch";

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 👉 If no token → guest user (allow request)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1].replace(/['"]+/g, '');
        const verifyToken = jwt.verify(token, key);

        const user = await User.findById(verifyToken._id);

        // 👉 If user not found → still allow as guest
        if (!user) {
            req.user = null;
            return next();
        }

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        // 👉 Even if token invalid/expired → treat as guest
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;