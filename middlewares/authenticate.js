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
        console.log(token);

        const verifyToken = jwt.verify(token, key);
        console.log(verifyToken);


        const user = await User.findById(verifyToken._id);
        console.log(user);

        if (!user) {
            return res.status(UNAUTHORIZED).json({ error: 'User not found' });
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(UNAUTHORIZED).json({ error: 'Token expired,Please Login First',status:UNAUTHORIZED });
        }
        return res.status(UNAUTHORIZED).json({ error: 'Unauthorized: Please Login First' });
    }
};

module.exports = authenticate;
