import { NextResponse } from 'next/server';
import { resetMobiscrollClient } from '@/lib/mobiscroll-client';

export async function GET() {
  resetMobiscrollClient();

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL));
}
