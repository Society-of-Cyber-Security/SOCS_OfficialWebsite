export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Submission, { SubmissionStatus } from '@/lib/models/Submission';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Project from '@/lib/models/Project';
import Event from '@/lib/models/Event';
import Resource from '@/lib/models/Resource';
import GalleryImage from '@/lib/models/GalleryImage';

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await authenticate(req);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    body.submittedBy = auth.user?._id;

    const submission = await Submission.create(body);
    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
