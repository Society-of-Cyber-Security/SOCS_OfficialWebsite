export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/lib/models/Event';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get('upcoming');
    const query: any = { isPublished: true };

    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
      const events = await Event.find(query).sort('date');
      return NextResponse.json({ success: true, count: events.length, data: events });
    }

    const events = await Event.find(query).sort('-date');
    return NextResponse.json({ success: true, count: events.length, data: events });
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
    const event = await Event.create(body);
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
