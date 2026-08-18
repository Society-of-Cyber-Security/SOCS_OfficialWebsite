import { Request, Response, NextFunction } from 'express';
import GalleryImage from '../models/GalleryImage';
import ErrorResponse from '../utils/errorResponse';
import { Role } from '../models/User';

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
export const getGalleryImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const images = await GalleryImage.find()
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload gallery image
// @route   POST /api/gallery/upload
// @access  Private (Admin+)
export const uploadGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Create image url
    // In production, this would be an S3 URL or similar
    const url = `/uploads/${req.file.filename}`;

    const image = await GalleryImage.create({
      filename: req.file.filename,
      url,
      caption: req.body.caption,
      uploadedBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private (Admin+)
export const deleteGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return next(new ErrorResponse(`Image not found with id of ${req.params.id}`, 404));
    }

    // Only allow superadmin or the user who uploaded it
    if (image.uploadedBy.toString() !== req.user?.id && req.user?.role !== Role.SUPERADMIN) {
      return next(new ErrorResponse(`User ${req.user?.id} is not authorized to delete this image`, 403));
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
