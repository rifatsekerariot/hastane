const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Try getting token from Cookie (Preferred)
    let token = req.cookies.token;

    // 2. Fallback to Header (for mobile apps or specialized clients)
    if (!token && req.header('Authorization')) {
        const authHeader = req.header('Authorization');
        token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'Yetkilendirme reddedildi: Token eksik' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_ChangeMeInProd');
        req.user = decoded;
        next();
    } catch (err) {
        // If token is invalid (expired), clear the cookie to avoid loops
        if (req.cookies.token) {
            res.clearCookie('token');
        }
        res.status(401).json({ msg: 'Token geçersiz' });
    }
};
