const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');

// Memory storage for Cloudinary upload
const memoryStorage = multer.memoryStorage();

// Local storage fallback for PDFs
const localFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/files';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files (jpg, png, webp) are allowed'));
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
};

// Upload to Cloudinary helper
const uploadToCloudinary = async (buffer, folder = 'studymart') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

const uploadImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

const uploadPdf = multer({
  storage: localFileStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = { uploadImages, uploadPdf, uploadToCloudinary };
