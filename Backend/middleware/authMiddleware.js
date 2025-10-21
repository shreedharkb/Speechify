const jwt = require('jsonwebtoken');

// This middleware checks for a valid token on incoming requests.
module.exports = function (req, res, next) {
  // 1. Get token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if no token is present
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  console.log('Token validation attempt');
  
  // 3. Verify the token
  try {
    // Use the same secret you used when creating the token in authController.js
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ msg: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user payload from the token to the request object
    req.user = decoded.user;
    next(); // Move on to the next middleware or the route handler
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

