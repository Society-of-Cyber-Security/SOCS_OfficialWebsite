import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateRequest, projectSchema } from '../utils/validators';
import { Role } from '../models/User';
import Joi from 'joi';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize(Role.ADMIN, Role.SUPERADMIN), validateRequest(projectSchema), createProject);

const updateSchema = projectSchema.fork(Object.keys(projectSchema.describe().keys), (schema) => schema.optional());

router.route('/:id')
  .patch(protect, authorize(Role.ADMIN, Role.SUPERADMIN), validateRequest(updateSchema), updateProject)
  .delete(protect, authorize(Role.ADMIN, Role.SUPERADMIN), deleteProject);

export default router;
