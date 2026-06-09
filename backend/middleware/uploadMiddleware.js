const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local storage fallback
const localImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/images';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

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

const uploadImages = multer({ storage: localImageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024, files: 5 } });
const uploadPdf = multer({ storage: localFileStorage, fileFilter: pdfFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { uploadImages, uploadPdf };
