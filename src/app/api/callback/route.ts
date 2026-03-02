import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';
import { defaultConfig } from '@/lib/default';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/api/logout', request.url));
  }

  const cookieStore = await cookies();
  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const client = getMobiscrollClient();
    const tokenResponse = await client.auth.getToken(code);

    cookieStore.set('access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (tokenResponse.refresh_token) {
      cookieStore.set('refresh_token', tokenResponse.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Token exchange failed:', error);
    return NextResponse.redirect(new URL(`/?error=token_exchange_failed`, request.url));
  }
}
