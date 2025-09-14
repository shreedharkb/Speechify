const User = require('../models/User');

// This middleware runs *after* authMiddleware.
// It checks if the authenticated user has the 'teacher' role.
module.exports = async function (req, res, next) {
  try {
    // Find the user by the ID that was decoded from the token
    const user = await User.findById(req.user.id);

    if (user && user.role === 'teacher') {
      next(); // The user is a teacher, so proceed.
    } else {
      // If the user is not a teacher, deny access.
      return res.status(403).json({ msg: 'Access denied. Teacher role required.' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

