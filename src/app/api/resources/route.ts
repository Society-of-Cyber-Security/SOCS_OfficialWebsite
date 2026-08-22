export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Resource from '@/lib/models/Resource';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    return NextResponse.json({ success: true, count: resources.length, data: resources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    body.uploadedBy = auth.user?._id;

    const resource = await Resource.create(body);
    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE RESOURCE FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
