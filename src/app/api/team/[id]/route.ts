export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import TeamMember from '@/lib/models/TeamMember';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const resolvedParams = await params;
    // Try to find by slug first, then by ID
    let member = await TeamMember.findOne({ slug: resolvedParams.id });
    if (!member && resolvedParams.id.match(/^[0-9a-fA-F]{24}$/)) {
      member = await TeamMember.findById(resolvedParams.id);
    }

    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const member = await TeamMember.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
      runValidators: true
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const auth = await authenticate(req, ['admin', 'superadmin']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const member = await TeamMember.findById(resolvedParams.id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }
    
    await member.deleteOne();
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
