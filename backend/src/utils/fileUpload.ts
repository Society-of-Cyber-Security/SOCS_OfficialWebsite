import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ErrorResponse from './errorResponse';

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // In a real app, this should be outside the public folder or in an S3 bucket
    // Since we're doing a local demo, we'll store in public/uploads 
    // Need to create the folder if it doesn't exist
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Check file type
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|webp|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Images Only (jpeg, jpg, png, webp, gif)!', 400) as any);
  }
}

// Init upload
export const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});
