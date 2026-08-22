import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import User, { IUser, Role } from './models/User';
import { connectDB } from './db';

// Verify token and optionally check role
export async function authenticate(req: NextRequest, allowedRoles?: string[]) {
  await connectDB();
  
  let token;

  // Check cookies for access token
  const cookieToken = req.cookies.get('accessToken')?.value;
  if (cookieToken) {
    token = cookieToken;
  } 
  // Alternatively check Auth header
  else {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return { error: 'Not authorized to access this route', status: 401 };
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      return { error: 'The user belonging to this token no longer exists.', status: 401 };
    }
    
    if (!user.isActive) {
      return { error: 'User account is deactivated.', status: 401 };
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return { error: `User role ${user.role} is not authorized to access this route`, status: 403 };
    }

    return { user };
  } catch (err) {
    return { error: 'Not authorized to access this route', status: 401 };
  }
}
