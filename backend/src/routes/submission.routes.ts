import express from 'express';
import { createSubmission, getMySubmissions, getPendingSubmissions, reviewSubmission } from '../controllers/submission.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateRequest, submissionSchema } from '../utils/validators';
import { Role } from '../models/User';
import Joi from 'joi';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/')
  .post(validateRequest(submissionSchema), createSubmission);

router.get('/mine', getMySubmissions);

router.get('/pending', authorize(Role.ADMIN, Role.SUPERADMIN), getPendingSubmissions);

const reviewSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reviewNote: Joi.string().optional()
});

router.patch('/:id/review', authorize(Role.ADMIN, Role.SUPERADMIN), validateRequest(reviewSchema), reviewSubmission);

export default router;
