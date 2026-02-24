const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

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

