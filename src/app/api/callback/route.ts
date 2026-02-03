import { NextRequest, NextResponse } from 'next/server';
import { getMobiscrollClient } from '@/lib/mobiscroll-client';
import { defaultConfig } from '@/lib/default';
import { saveTokens, Tokens } from '@/lib/token-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/api/logout', request.url));
  }

  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const client = getMobiscrollClient();
    const tokens = await client.auth.getToken(code);
    saveTokens(tokens as Tokens);

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Token exchange failed:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
