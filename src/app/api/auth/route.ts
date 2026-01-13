import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { defaultConfig } from '@/lib/default';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id') || 'demo-user';

  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Client credentials not configured' }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set('temp_client_id', clientId, {
    httpOnly: true,
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  cookieStore.set('temp_client_secret', clientSecret, {
    httpOnly: true,
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  const client = getMobiscrollClient('temporary');
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`;
  console.log('callbackUrl', callbackUrl)

  const authUrl = client.auth.getAuthorizationUrl({
    clientId,
    userId,
    redirectUri: callbackUrl,
  });

  return NextResponse.redirect(new URL(authUrl));
}
