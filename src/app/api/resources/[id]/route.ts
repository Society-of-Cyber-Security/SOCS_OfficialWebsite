import { NextRequest, NextResponse } from 'next/server';
import Resource from '@/lib/models/Resource';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const resource = await Resource.findById(id).populate('uploadedBy', 'name');
    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: resource });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    let resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    if (resource.uploadedBy.toString() !== auth.user?._id.toString() && auth.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    resource = await Resource.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    return NextResponse.json({ success: true, data: resource });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    if (resource.uploadedBy.toString() !== auth.user?._id.toString() && auth.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    await resource.deleteOne();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
