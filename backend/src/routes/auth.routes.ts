import express from 'express';
import { register, login, getMe, logout, refresh } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest, registerSchema, loginSchema } from '../utils/validators';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Specific rate limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

export default router;
