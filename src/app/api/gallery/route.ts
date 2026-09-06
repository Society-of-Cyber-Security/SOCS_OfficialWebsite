export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import GalleryImage from '@/lib/models/GalleryImage';
import '@/lib/models/Event'; // Register Event model for population
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    const album = searchParams.get('album');
    const eventId = searchParams.get('eventId');
    
    const query: any = {};
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (album && album.toLowerCase() !== 'all') {
      query.album = album;
    }
    if (eventId) {
      query.eventId = eventId;
    }

    const images = await GalleryImage.find(query)
      .populate('uploadedBy', 'name')
      .populate('eventId', 'title date location type')
      .sort('-createdAt');
    return NextResponse.json({ success: true, count: images.length, data: images });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const image = await GalleryImage.create({
      filename: body.title || body.filename || 'upload',
      url: body.url,
      caption: body.caption || body.title || body.category,
      album: body.album || body.category || 'General',
      eventId: body.eventId && body.eventId !== '' ? body.eventId : undefined,
      isFeatured: body.isFeatured === true,
      uploadedBy: auth.user?._id
    });
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
