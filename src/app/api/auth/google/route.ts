import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ success: false, error: 'Missing Google credential' }, { status: 400 });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ success: false, error: 'Invalid Google payload' }, { status: 400 });
    }

    const { email, name, sub: googleId } = payload;

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update googleId if not present (migration)
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      if (!user.isActive) {
        return NextResponse.json({ success: false, error: 'Your account has been deactivated' }, { status: 401 });
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || 'Operator',
        email,
        googleId,
      });
    }

    // Generate JWT access token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 200 });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'accessToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 1 day
    });

    return response;

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
