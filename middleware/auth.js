const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key-change-this-in-production';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token, authorization denied'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token is not valid'
        });
    }
};

module.exports = authMiddleware;