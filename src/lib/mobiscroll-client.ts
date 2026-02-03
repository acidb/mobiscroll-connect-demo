import { MobiscrollConnectClient } from '@mobiscroll/connect-sdk';
import { defaultConfig } from './default';

interface CookieStore {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: any): void;
}

/**
 * Get a Mobiscroll Connect client instance
 * This should ONLY be used in server-side code (API routes, Server Components, Server Actions)
 * NEVER expose client secret to the browser
 */
export function getMobiscrollClient() {
  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;
  const redirectUri = defaultConfig.mobiscrollRedirectUri;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Mobiscroll Connect credentials in environment variables');
  }

  return new MobiscrollConnectClient({
    clientId,
    clientSecret,
    redirectUri,
  });
}

export function configureMobiscrollClient(client: MobiscrollConnectClient, cookieStore: CookieStore) {
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (accessToken || refreshToken) {
    client.setCredentials({
      access_token: accessToken || '',
      refresh_token: refreshToken,
      token_type: 'Bearer',
    });
  }

  client.on('tokens', (tokens) => {
    if (tokens.access_token) {
      cookieStore.set('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  });
}
