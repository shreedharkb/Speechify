const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify Token
exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error in token verification:', err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};