const User = require('../models/User');
const prisma = require('../config/prisma');

// This middleware runs *after* authMiddleware.
// It checks if the authenticated user has the 'teacher' role.
module.exports = async function (req, res, next) {
  try {
    // Check role from JWT token first (set by authMiddleware)
    if (req.user.role === 'teacher') {
      // Verify teacher exists in database
      const teacher = await prisma.teacher.findUnique({
        where: { id: req.user.id }
      });
      
      if (teacher) {
        next(); // The user is a teacher, so proceed.
        return;
      }
    }
    
    // Fallback to old User model for backward compatibility
    const user = await User.findById(req.user.id);
    if (user && user.role === 'teacher') {
      next(); // The user is a teacher, so proceed.
    } else {
      // If the user is not a teacher, deny access.
      return res.status(403).json({ msg: 'Access denied. Teacher role required.' });
    }
  } catch (err) {
    console.error('Teacher middleware error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

