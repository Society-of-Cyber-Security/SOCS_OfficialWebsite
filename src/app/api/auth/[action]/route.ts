import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import jwt from 'jsonwebtoken';

function sendTokenResponse(user: any, statusCode: number) {
  // Create Access Token
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE || '15m') as any
  });

  // Create Refresh Token
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any
  });

  user.refreshToken = refreshToken;
  
  const response = NextResponse.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, { status: statusCode });

  response.cookies.set('accessToken', accessToken, {
    maxAge: 15 * 60, // 15 mins
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  response.cookies.set('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return response;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  try {
    if (action === 'register') {
      const { name, email, password, role } = await req.json();
      const user = await User.create({ name, email, password, role });
      const response = sendTokenResponse(user, 201);
      await user.save({ validateBeforeSave: false }); // save refresh token
      return response;
    }

    if (action === 'login') {
      const { email, password } = await req.json();
      const user = await User.findOne({ email }).select('+password');

        console.log("DB:", User.db.name);
        console.log("COLLECTION:", User.collection.name);
        console.log("USER COUNT:", await User.countDocuments());
        console.log("USER FOUND:", !!user);

        if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      if (user.isLocked()) {
        return NextResponse.json({ success: false, error: 'Account locked. Try again later.' }, { status: 401 });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await user.save({ validateBeforeSave: false });
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      user.loginAttempts = 0;
      user.lockUntil = undefined;
      const response = sendTokenResponse(user, 200);
      await user.save({ validateBeforeSave: false });
      return response;
    }

    if (action === 'logout') {
      const auth = await authenticate(req);
      if (auth.user) {
        auth.user.refreshToken = undefined;
        await auth.user.save({ validateBeforeSave: false });
      }

      const response = NextResponse.json({ success: true, data: {} }, { status: 200 });
      response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
      response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
      return response;
    }

    if (action === 'refresh') {
      const refreshToken = req.cookies.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
      }

      const response = sendTokenResponse(user, 200);
      await user.save({ validateBeforeSave: false });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  if (action === 'me') {
    const auth = await authenticate(req);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    return NextResponse.json({ success: true, data: auth.user }, { status: 200 });
  }

  return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
}
