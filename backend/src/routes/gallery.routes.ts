import express from 'express';
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage } from '../controllers/gallery.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { uploadImage } from '../utils/fileUpload';
import { Role } from '../models/User';

const router = express.Router();

router.route('/')
  .get(getGalleryImages);

router.route('/upload')
  .post(protect, authorize(Role.ADMIN, Role.SUPERADMIN), uploadImage.single('image'), uploadGalleryImage);

router.route('/:id')
  .delete(protect, authorize(Role.ADMIN, Role.SUPERADMIN), deleteGalleryImage);

export default router;
