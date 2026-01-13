import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('temp_client_id');
  cookieStore.delete('temp_client_secret');

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL));
}
