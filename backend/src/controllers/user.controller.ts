import { Request, Response, NextFunction } from 'express';
import User, { Role } from '../models/User';
import ErrorResponse from '../utils/errorResponse';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Super Admin)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user role
// @route   PATCH /api/users/:id/role
// @access  Private (Admin, Super Admin)
export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (user.id === req.user?.id) {
      return next(new ErrorResponse('You cannot change your own role', 400));
    }

    // Constraints for Admins
    if (req.user?.role === Role.ADMIN) {
      if (user.role === Role.SUPERADMIN) {
        return next(new ErrorResponse('Admins cannot modify Super Admins', 403));
      }
      if (req.body.role === Role.SUPERADMIN) {
        return next(new ErrorResponse('Admins cannot promote users to Super Admin', 403));
      }
    }

    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate/Activate user
// @route   PATCH /api/users/:id/status
// @access  Private (Admin, Super Admin)
export const changeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (user.id === req.user?.id) {
      return next(new ErrorResponse('You cannot deactivate yourself', 400));
    }

    if (req.user?.role === Role.ADMIN && user.role === Role.SUPERADMIN) {
      return next(new ErrorResponse('Admins cannot deactivate Super Admins', 403));
    }

    user.isActive = req.body.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin, Super Admin)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (user.id === req.user?.id) {
      return next(new ErrorResponse('You cannot delete yourself', 400));
    }

    if (req.user?.role === Role.ADMIN && user.role === Role.SUPERADMIN) {
      return next(new ErrorResponse('Admins cannot delete Super Admins', 403));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
