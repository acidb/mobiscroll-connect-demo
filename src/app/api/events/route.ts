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

  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start') || undefined;
  const end = searchParams.get('end') || undefined;
  const paging = searchParams.get('paging') || undefined;
  const pageSize = Number(searchParams.get('pageSize')) || 50;
  const singleEvents = searchParams.get('singleEvents') !== 'false';

  let calendarIds;
  const calendarIdsParam = searchParams.get('calendarIds');
  if (calendarIdsParam) {
    try {
      calendarIds = JSON.parse(decodeURIComponent(calendarIdsParam));
    } catch (e) {
      calendarIds = undefined;
    }
  }

  try {
    const client = getMobiscrollClient();
    configureMobiscrollClient(client, cookieStore);

    const events = await client.events.list({
      pageSize: Math.min(pageSize, 1000),
      start,
      end,
      calendarIds: calendarIds || {
        google: [],
        microsoft: [],
        apple: [],
      },
      nextPageToken: paging,
      singleEvents,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Authentication expired' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const client = getMobiscrollClient();
    configureMobiscrollClient(client, cookieStore);

    const { provider } = body;

    if (!provider || !['google', 'microsoft', 'apple'].includes(provider)) {
      return NextResponse.json({ error: 'Valid provider (google, microsoft, apple) is required' }, { status: 400 });
    }

    const event = await client.events.create(body);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const client = getMobiscrollClient();
    configureMobiscrollClient(client, cookieStore);

    const { provider } = body;

    if (!provider || !['google', 'microsoft', 'apple'].includes(provider)) {
      return NextResponse.json({ error: 'Valid provider (google, microsoft, apple) is required' }, { status: 400 });
    }

    const event = await client.events.update(body);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const client = getMobiscrollClient();
    configureMobiscrollClient(client, cookieStore);

    if (!body.provider || !['google', 'microsoft', 'apple'].includes(body.provider)) {
      return NextResponse.json({ error: 'Valid provider (google, microsoft, apple) is required in request body' }, { status: 400 });
    }

    const result = await client.events.delete(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete event' }, { status: 500 });
  }
}
