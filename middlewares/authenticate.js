const jwt = require("jsonwebtoken");
const User = require('../modals/user.modal');
const key = "MySecretOkDontTouch"
const { UNAUTHORIZED } = require("../utils/httpCodeStatus.js")
const authenticate = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(UNAUTHORIZED).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1].replace(/['"]+/g, '');

        const verifyToken = jwt.verify(token, key);

        const user = await User.findById(verifyToken._id);
        if (!user) {
            return res.status(UNAUTHORIZED).json({ error: 'User not found' });
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(UNAUTHORIZED).json({ error: 'Token expired' });
        }
        return res.status(UNAUTHORIZED).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
