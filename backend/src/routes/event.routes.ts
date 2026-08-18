import express from 'express';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';
import { validateRequest, eventSchema } from '../utils/validators';

const router = express.Router();

router
  .route('/')
  .get(getEvents)
  .post(protect, authorize(Role.ADMIN, Role.SUPERADMIN), validateRequest(eventSchema), createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize(Role.ADMIN, Role.SUPERADMIN), validateRequest(eventSchema), updateEvent)
  .delete(protect, authorize(Role.ADMIN, Role.SUPERADMIN), deleteEvent);

export default router;
