import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/api/logout', request.url));
  }

  const cookieStore = await cookies();
  const clientId = cookieStore.get('temp_client_id')?.value;
  const clientSecret = cookieStore.get('temp_client_secret')?.value;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const client = getMobiscrollClient('temporary');
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`;

    const tokenResponse = await client.auth.exchangeCodeForToken(code, clientId, clientSecret, callbackUrl);

    cookieStore.set('access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.delete('temp_client_id');
    cookieStore.delete('temp_client_secret');

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Token exchange failed:', error);
    cookieStore.delete('temp_client_id');
    cookieStore.delete('temp_client_secret');
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
