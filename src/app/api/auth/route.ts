import { NextRequest, NextResponse } from 'next/server';
import { defaultConfig } from '@/lib/default';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id') || 'demo-user';
  const providers = searchParams.get('providers') || 'google,apple,microsoft,caldav';

  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Client credentials not configured' }, { status: 500 });
  }

  const client = getMobiscrollClient();

  const authUrl = client.auth.generateAuthUrl({
    userId,
    providers,
  });

  return NextResponse.redirect(new URL(authUrl));
}
