const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const teacherMiddleware = require('../middleware/teacherMiddleware');

// Create uploads/images directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Protected routes - require teacher authentication
router.use(authMiddleware);
router.use(teacherMiddleware);

// POST /api/images/upload - Upload a single image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        msg: 'No image file uploaded' 
      });
    }

    // Generate the URL path for the uploaded image
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    console.log('Image uploaded successfully:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: imageUrl
    });

    res.json({
      success: true,
      msg: 'Image uploaded successfully',
      image: {
        filename: req.file.filename,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Failed to upload image',
      error: error.message 
    });
  }
});

// POST /api/images/upload-multiple - Upload multiple images
router.post('/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'No image files uploaded' 
      });
    }

    const images = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname
    }));

    console.log(`${images.length} images uploaded successfully`);

    res.json({
      success: true,
      msg: `${images.length} image(s) uploaded successfully`,
      images: images
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Failed to upload images',
      error: error.message 
    });
  }
});

// DELETE /api/images/:filename - Delete an uploaded image
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false,
        msg: 'Image not found' 
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    console.log('Image deleted:', filename);

    res.json({
      success: true,
      msg: 'Image deleted successfully',
      filename: filename
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Failed to delete image',
      error: error.message 
    });
  }
});

module.exports = router;
