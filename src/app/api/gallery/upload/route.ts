import { NextRequest, NextResponse } from 'next/server';
import GalleryImage from '@/lib/models/GalleryImage';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

async function saveFileLocally(file: File, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}

async function uploadSingleFile(file: File): Promise<{ url: string; filename: string }> {
  const ext = path.extname(file.name) || '.jpg';
  const uniqueSuffix = uuidv4() + ext;
  const filename = 'image-' + uniqueSuffix;

  // Try Vercel Blob first
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, { access: 'public' });
      return { url: blob.url, filename };
    }
  } catch (blobErr) {
    console.warn("Vercel Blob failed, falling back to local file storage:", blobErr);
  }

  // Fallback to local file saving
  const url = await saveFileLocally(file, filename);
  return { url, filename };
}

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await req.formData();
    
    // Support multiple files from 'images', 'image', 'files', or 'file'
    const files: File[] = [];
    const imageEntries = formData.getAll('images').concat(formData.getAll('image')).concat(formData.getAll('files')).concat(formData.getAll('file'));
    
    for (const entry of imageEntries) {
      if (entry && typeof entry === 'object' && 'name' in entry && (entry as File).size > 0) {
        files.push(entry as File);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'Please upload at least one image file' }, { status: 400 });
    }

    const baseCaption = (formData.get('caption') as string)?.trim();
    const album = (formData.get('album') as string)?.trim() || 'General';
    const eventId = (formData.get('eventId') as string)?.trim();
    const directAdd = formData.get('directAdd') === 'true' || auth.user?.role === 'admin' || auth.user?.role === 'superadmin';

    const uploadedResults: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { url, filename } = await uploadSingleFile(file);
      
      const fileCleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();

      const imageCaption = baseCaption 
        ? (files.length > 1 ? `${baseCaption} (${i + 1})` : baseCaption)
        : (fileCleanName || `${album} Capture`);

      if (directAdd && (auth.user?.role === 'admin' || auth.user?.role === 'superadmin')) {
        const image = await GalleryImage.create({
          filename,
          url,
          caption: imageCaption,
          album,
          eventId: eventId && eventId !== '' ? eventId : undefined,
          uploadedBy: auth.user?._id
        });
        uploadedResults.push(image);
      } else {
        uploadedResults.push({ url, filename, caption: imageCaption });
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: uploadedResults.length,
      data: files.length === 1 ? uploadedResults[0] : uploadedResults 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Gallery Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
