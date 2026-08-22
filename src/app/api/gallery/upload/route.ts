import { NextRequest, NextResponse } from 'next/server';
import GalleryImage from '@/lib/models/GalleryImage';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Please upload a file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = uuidv4() + path.extname(file.name);
    const filename = 'image-' + uniqueSuffix;
    
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch(e) {}
    
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    const image = await GalleryImage.create({
      filename,
      url,
      caption,
      uploadedBy: auth.user?._id
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
