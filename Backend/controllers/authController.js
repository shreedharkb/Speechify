const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');
const { redis } = require('../config/redis');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- User Registration Logic ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNo, branch, year, semester } = req.body;
    
    // Determine which table to check and insert into based on role
    if (role === 'teacher') {
      // Check if teacher already exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email }
      });
      
      if (existingTeacher) {
        return res.status(400).json({ msg: 'Teacher with this email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create teacher
      const teacher = await prisma.teacher.create({
        data: {
          name,
          email,
          password: hashedPassword,
          branch: department || branch || 'General'
        }
      });

      return res.status(201).json({ msg: 'Teacher registered successfully!', userId: teacher.id });
      
    } else if (role === 'student') {
      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { email }
      });
      
      if (existingStudent) {
        return res.status(400).json({ msg: 'Student with this email already exists' });
      }

      // Check if roll number already exists
      if (rollNo) {
        const existingRollNo = await prisma.student.findUnique({
          where: { rollNo }
        });
        
        if (existingRollNo) {
          return res.status(400).json({ msg: 'Student with this roll number already exists' });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Parse year and semester to integers
      const yearInt = year ? (typeof year === 'string' ? parseInt(year.replace(/[^\d]/g, '')) : parseInt(year)) : 1;
      const semesterInt = semester ? (typeof semester === 'string' ? ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].indexOf(semester) + 1 : parseInt(semester)) : 1;

      // Create student
      const student = await prisma.student.create({
        data: {
          name,
          email,
          password: hashedPassword,
          rollNo: rollNo || `ROLL${Date.now()}`,
          branch: branch || 'General',
          year: yearInt,
          semester: semesterInt
        }
      });

      return res.status(201).json({ msg: 'Student registered successfully!', userId: student.id });
      
    } else {
      // Invalid role specified
      return res.status(400).json({ msg: 'Invalid role. Must be either "teacher" or "student"' });
    }
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

// --- User Login Logic ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = null;
    let role = null;
    
    // Try to find in teachers table first
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });
    
    if (teacher) {
      user = teacher;
      role = 'teacher';
    } else {
      // Try to find in students table
      const student = await prisma.student.findUnique({
        where: { email }
      });
      
      if (student) {
        user = student;
        role = 'student';
      }
    }
    
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
        role: role
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
            role: role
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
// NOTE: This function is deprecated after migration to separate teachers/students tables
// To migrate a student to teacher, you need to create a new teacher record and
// optionally delete the student record if needed
exports.makeTeacher = async (req, res) => {
  return res.status(501).json({ 
    msg: 'This endpoint is deprecated. Users are now created directly as teachers or students.' 
  });
};

// --- Google Authentication Logic ---
exports.googleAuth = async (req, res) => {
  try {
    const { token, role, branch } = req.body;
    
    if (!token) {
      return res.status(400).json({ msg: 'No token provided' });
    }

    let payload = null;

    try {
      if (token.length > 1000) {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info with access token');
        }
        payload = await response.json();
      }
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr);
      return res.status(401).json({ msg: 'Invalid Google token' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ msg: 'Invalid token payload' });
    }

    const { email, name, picture } = payload;
    let user = null;
    let userRole = null;

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (teacher) {
      user = teacher;
      userRole = 'teacher';
    } else {
      const student = await prisma.student.findUnique({ where: { email } });
      if (student) {
        user = student;
        userRole = 'student';
      }
    }

    if (!user) {
      if (!role) {
        return res.status(404).json({ msg: 'User not found. Please sign up first.', requiresSignup: true });
      }

      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      if (role === 'teacher') {
        user = await prisma.teacher.create({
          data: {
            name,
            email,
            password: hashedPassword,
            branch: branch || 'General',
          }
        });
        userRole = 'teacher';
      } else if (role === 'student') {
        user = await prisma.student.create({
          data: {
            name,
            email,
            password: hashedPassword,
            rollNo: `ROLL${Date.now()}`,
            branch: branch || 'General',
            year: 1,
            semester: 1
          }
        });
        userRole = 'student';
      } else {
        return res.status(400).json({ msg: 'Invalid role specified' });
      }
    }

    const jwtPayload = {
      user: {
        id: user.id,
        role: userRole
      }
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, jwtToken) => {
        if (err) throw err;
        res.json({
          token: jwtToken,
          user: {
            id: user.id,
            name: user.name,
            role: userRole
          }
        });
      }
    );
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ msg: 'Google Authentication Failed', error: err.message });
  }
};

// --- Password Reset Logic ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Please provide an email' });

    // Check if user exists (check teacher, then student)
    let user = await prisma.teacher.findUnique({ where: { email } });
    let role = 'teacher';
    if (!user) {
      user = await prisma.student.findUnique({ where: { email } });
      role = 'student';
    }

    if (!user) {
      // Don't leak that the user doesn't exist, just return success
      return res.json({ msg: 'If that email is registered, a password reset link has been sent.' });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store in Redis with 1 hour expiration
    await redis.setex(`reset_token:${email}`, 3600, resetToken);

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}?page=reset-password&token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Set up nodemailer transporter
    console.log('\n======================================================');
    console.log(' PASSWORD RESET REQUESTED ');
    console.log('------------------------------------------------------');
    console.log(` To: ${email}`);
    console.log(` Link: ${resetUrl}`);
    console.log(' (This link will expire in 1 hour)');
    console.log('======================================================\n');

    // Attempt to send email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Speechify Support" <noreply@speechify.local>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h3>Password Reset</h3>
          <p>You requested a password reset. Click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    }

    res.json({ msg: 'If that email is registered, a password reset link has been sent. Check your server console if running locally.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error during password reset' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ msg: 'Please provide email, token, and new password' });
    }

    // Verify token from Redis
    const storedToken = await redis.get(`reset_token:${email}`);
    
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ msg: 'Invalid or expired password reset token' });
    }

    // Check if user exists
    let user = await prisma.teacher.findUnique({ where: { email } });
    let isTeacher = true;
    if (!user) {
      user = await prisma.student.findUnique({ where: { email } });
      isTeacher = false;
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password in DB
    if (isTeacher) {
      await prisma.teacher.update({
        where: { email },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.student.update({
        where: { email },
        data: { password: hashedPassword },
      });
    }

    // Delete token from Redis so it can't be reused
    await redis.del(`reset_token:${email}`);

    res.json({ msg: 'Password has been successfully reset. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error during password reset' });
  }
};

