import Joi from 'joi';
import { Role } from './models/User';
import { SubmissionType } from './models/Submission';

export const registerSchema = Joi.object({
  name: Joi.string().required().max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(Role)).default(Role.MEMBER)
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const submissionSchema = Joi.object({
  type: Joi.string().valid(...Object.values(SubmissionType)).required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  payload: Joi.any().optional(),
  attachmentUrl: Joi.string().uri().optional().allow('')
});

export const projectSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  tags: Joi.array().items(Joi.string()).required(),
  repoUrl: Joi.string().uri().optional(),
  isPublished: Joi.boolean().optional()
});

export const eventSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  date: Joi.date().required(),
  location: Joi.string().required(),
  type: Joi.string().valid('workshop', 'ctf', 'meetup', 'guest_speaker', 'other').default('other'),
  registrationLink: Joi.string().uri().optional(),
  isPublished: Joi.boolean().optional()
});

// Helper for validating requests
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    if (req.user) {
      req.body.user = req.user?.id;
    }
    const { error } = schema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0]?.message || 'Validation error' });
    }
    next();
  };
};
