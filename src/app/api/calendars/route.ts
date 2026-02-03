import { NextRequest, NextResponse } from 'next/server';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET(request: NextRequest) {
  const client = getMobiscrollClient();

  try {
    const calendars = await client.calendars.list();

    return NextResponse.json(calendars);
  } catch (error) {
    console.error('Error fetching calendars:', error);

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Authentication expired' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}
