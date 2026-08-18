import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import ErrorResponse from '../utils/errorResponse';
import { Role } from '../models/User';

// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.find({ isPublished: true })
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new project directly
// @route   POST /api/projects
// @access  Private (Admin+)
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.uploadedBy = req.user?.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private (Admin+)
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is project owner or Super Admin
    if (project.uploadedBy.toString() !== req.user?.id && req.user?.role !== Role.SUPERADMIN) {
      return next(new ErrorResponse(`User ${req.user?.id} is not authorized to update this project`, 403));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin+)
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is project owner or Super Admin
    if (project.uploadedBy.toString() !== req.user?.id && req.user?.role !== Role.SUPERADMIN) {
      return next(new ErrorResponse(`User ${req.user?.id} is not authorized to delete this project`, 403));
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
