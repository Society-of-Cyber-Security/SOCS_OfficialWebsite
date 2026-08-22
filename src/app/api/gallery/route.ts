export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import GalleryImage from '@/lib/models/GalleryImage';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    
    const query: any = {};
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const images = await GalleryImage.find(query)
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    return NextResponse.json({ success: true, count: images.length, data: images });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
