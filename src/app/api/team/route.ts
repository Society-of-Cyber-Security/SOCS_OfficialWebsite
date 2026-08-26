export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import TeamMember from '@/lib/models/TeamMember';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const members = await TeamMember.find({}).sort('-createdAt');
    // Ideally we might want to sort them by tier (core first, then lead, then member)
    const sortedMembers = members.sort((a, b) => {
      const order = { 'core': 1, 'lead': 2, 'member': 3, 'mentor': 4 };
      return (order[a.tier as keyof typeof order] || 3) - (order[b.tier as keyof typeof order] || 3);
    });
    
    return NextResponse.json({ success: true, count: sortedMembers.length, data: sortedMembers });
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
    
    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Convert comma-separated string to array for skills if needed
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const member = await TeamMember.create(body);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    // Check for duplicate slug
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'A member with that generated slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
