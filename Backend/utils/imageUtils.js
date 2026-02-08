/**
 * Image Utilities
 * Handles conversion of base64 data URIs to image files
 */

const fs = require('fs').promises;
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'images');

/**
 * Ensure the uploads/images directory exists
 */
async function ensureUploadsDirectory() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Convert a base64 data URI to an image file
 * @param {string} dataUri - The data URI (e.g., "data:image/png;base64,...")
 * @param {string} prefix - Optional prefix for the filename
 * @returns {Promise<string>} - The URL path to access the saved image (e.g., "/uploads/images/...")
 */
async function saveBase64Image(dataUri, prefix = 'quiz-image') {
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
    throw new Error('Invalid data URI');
  }

  try {
    await ensureUploadsDirectory();

    // Extract the image format and base64 data
    const matches = dataUri.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URI format');
    }

    const imageFormat = matches[1]; // png, jpeg, gif, etc.
    const base64Data = matches[2];

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const filename = `${prefix}-${timestamp}-${random}.${imageFormat}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filePath, buffer);

    // Return the URL path (not file system path)
    return `/uploads/images/${filename}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
}

/**
 * Check if a string is a base64 data URI
 * @param {string} str - The string to check
 * @returns {boolean} - True if it's a data URI
 */
function isDataUri(str) {
  return typeof str === 'string' && str.startsWith('data:image/');
}

module.exports = {
  saveBase64Image,
  isDataUri,
  ensureUploadsDirectory
};
