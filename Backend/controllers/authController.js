const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- User Registration Logic ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    res.status(201).json({ msg: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- User Login Logic ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    // Use JWT secret from environment for signing tokens
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // Send back the token AND a user object with the role
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- Update User Role to Teacher ---
exports.makeTeacher = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update role
    await User.update(user.id, { role: 'teacher' });

    res.json({ msg: `User ${user.name} has been updated to a teacher.` });
  } catch (err) {
    console.error('Make teacher error:', err.message);
    res.status(500).send('Server Error');
  }
};

