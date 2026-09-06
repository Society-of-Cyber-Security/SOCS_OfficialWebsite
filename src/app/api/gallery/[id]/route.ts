import { NextRequest, NextResponse } from 'next/server';
import GalleryImage from '@/lib/models/GalleryImage';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const image = await GalleryImage.findById(id);

    if (!image) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
    }

    await image.deleteOne();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    
    const image = await GalleryImage.findById(id);
    if (!image) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
    }

    if (body.isFeatured !== undefined) {
      image.isFeatured = body.isFeatured === true || body.isFeatured === 'true';
      image.markModified('isFeatured');
    }
    if (body.caption !== undefined) {
      image.caption = body.caption;
      image.markModified('caption');
    }
    if (body.album !== undefined) {
      image.album = body.album;
      image.markModified('album');
    }
    if (body.eventId !== undefined) {
      image.eventId = body.eventId && body.eventId !== '' ? body.eventId : undefined;
      image.markModified('eventId');
    }

    await image.save();
    return NextResponse.json({ success: true, data: image });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
