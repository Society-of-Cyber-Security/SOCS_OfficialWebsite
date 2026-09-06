export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Submission, { SubmissionStatus } from '@/lib/models/Submission';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Project from '@/lib/models/Project';
import Event from '@/lib/models/Event';
import Resource from '@/lib/models/Resource';
import GalleryImage from '@/lib/models/GalleryImage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;
  
  if (action === 'mine') {
    const auth = await authenticate(req);
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    
    try {
      const submissions = await Submission.find({ submittedBy: auth.user?._id })
        .populate('reviewedBy', 'name')
        .sort('-createdAt');
      return NextResponse.json({ success: true, count: submissions.length, data: submissions });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  if (action === 'pending' || action === 'all') {
    const auth = await authenticate(req, ['admin', 'superadmin']);
    if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    
    try {
      const query = action === 'pending' ? { status: SubmissionStatus.PENDING } : {};
      const submissions = await Submission.find(query)
        .populate('submittedBy', 'name email')
        .populate('reviewedBy', 'name')
        .sort('-createdAt');
      return NextResponse.json({ success: true, count: submissions.length, data: submissions });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }
  
  // Treat action as ID if it's none of the above
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const submission = await Submission.findById(action)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name');

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const isOwner = submission.submittedBy && (submission.submittedBy as any)._id?.toString() === auth.user?.id;
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'superadmin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    let submission = await Submission.findById(action);

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const isOwner = submission.submittedBy && submission.submittedBy.toString() === auth.user?.id;
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    if (submission.status !== SubmissionStatus.PENDING) {
      return NextResponse.json({ success: false, error: 'Submission already processed' }, { status: 400 });
    }

    // Review logic (Only Admins)
    if (body.status === 'approved' || body.status === 'rejected') {
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Not authorized to review' }, { status: 403 });
      }

      submission.status = body.status;
      submission.reviewNote = body.reviewNote;
      submission.reviewedBy = auth.user?._id as any;

      if (submission.status === SubmissionStatus.APPROVED && submission.payload) {
        const p = submission.payload;
        if (submission.type === 'project') {
          const projectData: any = {
            title: submission.title,
            description: submission.description,
            tags: p.tags || [],
            uploadedBy: submission.submittedBy,
            isPublished: true
          };
          const repoUrl = p.repoUrl || submission.attachmentUrl;
          if (repoUrl) projectData.repoUrl = repoUrl;
          
          await Project.create(projectData);
        } else if (submission.type === 'event') {
          const eventData: any = {
            title: submission.title,
            description: submission.description,
            date: p.date || new Date(),
            location: p.location || 'TBA',
            type: p.type || 'other',
            isPublished: true
          };
          const regLink = p.registrationLink || submission.attachmentUrl;
          if (regLink) eventData.registrationLink = regLink;
          
          await Event.create(eventData);
        } else if (submission.type === 'resource') {
          const resourceData: any = {
            title: submission.title,
            description: submission.description,
            category: p.category || 'other',
            tags: p.tags || [],
            uploadedBy: submission.submittedBy
          };
          const url = p.url || p.fileUrl || submission.attachmentUrl;
          if (url) resourceData.url = url;
          
          await Resource.create(resourceData);
        } else if (submission.type === 'gallery') {
          const galleryData: any = {
            filename: p.filename || submission.title.toLowerCase().replace(/\s+/g, '-'),
            caption: submission.title,
            album: p.album || p.category || 'General',
            eventId: p.eventId || undefined,
            uploadedBy: submission.submittedBy
          };
          const url = p.url || p.imageUrl || submission.attachmentUrl;
          if (url) galleryData.url = url;
          
          await GalleryImage.create(galleryData);
        }
      }
    } else {
      // Update data logic (Both Owner and Admin)
      const allowedFields = ['title', 'description', 'payload', 'attachmentUrl', 'type'];
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          (submission as any)[field] = body[field];
        }
      }
    }

    await submission.save();
    await submission.populate('submittedBy', 'name email');
    
    return NextResponse.json({ success: true, data: submission });
  } catch (e: any) {
    console.error("PATCH SUBMISSION REVIEWS FAILED:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;
  
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const submission = await Submission.findById(action);
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const isOwner = submission.submittedBy && submission.submittedBy.toString() === auth.user?.id;
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    if (isOwner && !isAdmin && submission.status !== SubmissionStatus.PENDING) {
      return NextResponse.json({ success: false, error: 'Cannot delete processed submission' }, { status: 400 });
    }

    await submission.deleteOne();
    return NextResponse.json({ success: true, data: {} });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
