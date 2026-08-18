import express from 'express';
import { getResources, getResource, createResource, updateResource, deleteResource } from '../controllers/resource.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router
  .route('/')
  .get(getResources)
  .post(protect, authorize(Role.ADMIN, Role.SUPERADMIN), createResource);

router
  .route('/:id')
  .get(getResource)
  .put(protect, authorize(Role.ADMIN, Role.SUPERADMIN), updateResource)
  .delete(protect, authorize(Role.ADMIN, Role.SUPERADMIN), deleteResource);

export default router;
