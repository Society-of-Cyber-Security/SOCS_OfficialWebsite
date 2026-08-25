export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const { role } = await req.json();
    
    const user = await User.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Admin cannot modify superadmin
    if (auth.user?.role === 'admin' && user.role === 'superadmin') {
      return NextResponse.json({ success: false, error: 'Not authorized to modify superadmin' }, { status: 403 });
    }

    // Only superadmin can make someone else a superadmin
    if (role === 'superadmin' && auth.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Only superadmin can grant superadmin role' }, { status: 403 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
