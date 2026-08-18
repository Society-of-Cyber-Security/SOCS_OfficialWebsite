import { Request, Response, NextFunction } from 'express';
import Resource from '../models/Resource';
import ErrorResponse from '../utils/errorResponse';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resources = await Resource.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
export const getResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin
export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user to req.body
    req.body.uploadedBy = req.user?.id;

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
