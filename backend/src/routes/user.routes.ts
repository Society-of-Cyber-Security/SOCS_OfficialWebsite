import express from 'express';
import { getUsers, changeUserRole, changeUserStatus, deleteUser } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';
import Joi from 'joi';
import { validateRequest } from '../utils/validators';

const router = express.Router();

router.use(protect);
router.use(authorize(Role.ADMIN, Role.SUPERADMIN)); // Admin & SuperAdmin allowed

router.route('/')
  .get(getUsers);

const roleSchema = Joi.object({
  role: Joi.string().valid(...Object.values(Role)).required()
});

router.route('/:id/role')
  .patch(validateRequest(roleSchema), changeUserRole);

const statusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

router.route('/:id/status')
  .patch(validateRequest(statusSchema), changeUserStatus);

router.route('/:id')
  .delete(deleteUser);

export default router;
