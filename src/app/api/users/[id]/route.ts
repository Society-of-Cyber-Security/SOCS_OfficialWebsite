export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const user = await User.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Admin cannot delete superadmin
    if (auth.user?.role === 'admin' && user.role === 'superadmin') {
      return NextResponse.json({ success: false, error: 'Not authorized to delete superadmin' }, { status: 403 });
    }

    await user.deleteOne();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
