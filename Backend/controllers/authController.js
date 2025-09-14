const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- User Registration Logic --- (No changes here)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ msg: 'User registered successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- User Login Logic --- (UPDATED)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = {
      user: {
        id: user.id,
        // We can also include the role in the token itself
        role: user.role
      },
    };
    jwt.sign(
      payload,
      'your_jwt_secret', // IMPORTANT: Replace with your actual secret
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // ** THE KEY CHANGE IS HERE **
        // We now send back the token AND a user object with the role.
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Update User Role to Teacher --- (No changes here)
exports.makeTeacher = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.role = 'teacher';
    await user.save();
    res.json({ msg: `User ${user.name} has been updated to a teacher.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

