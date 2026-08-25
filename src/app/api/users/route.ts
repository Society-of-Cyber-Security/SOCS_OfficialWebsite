export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const users = await User.find({}).select('-password');
    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
