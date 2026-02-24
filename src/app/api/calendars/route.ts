import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMobiscrollClient, configureMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const client = getMobiscrollClient();
    configureMobiscrollClient(client, cookieStore);

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
