import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { connectDB } from './config/db';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001'
    ];
    
    // Check if origin is allowed or if it's localhost
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Body parser
app.use(express.json());

import path from 'path';
// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Rate Limiting (Disabled for local dev/testing)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // Increased limit for dev/build to 1000
//   message: { success: false, error: 'Too many requests, please try again later.' }
// });

// const speedLimiter = slowDown({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   delayAfter: 500, // Increased limit
//   delayMs: () => 500 // begin adding 500ms of delay per request above 500
// });

// Apply rate limiting and slow down globally
// app.use(limiter);
// app.use(speedLimiter);

// Security Middleware
app.use(helmet());

import authRoutes from './routes/auth.routes';
import submissionRoutes from './routes/submission.routes';
import projectRoutes from './routes/project.routes';
import galleryRoutes from './routes/gallery.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import resourceRoutes from './routes/resource.routes';
import errorHandler from './middleware/error.middleware';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
