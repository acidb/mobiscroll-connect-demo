import { MobiscrollConnectClient } from '@mobiscroll/connect-sdk';

/**
 * Get a Mobiscroll Connect client instance
 * This should ONLY be used in server-side code (API routes, Server Components, Server Actions)
 * NEVER expose client secret to the browser
 */
export function getMobiscrollClient(accessToken: string) {
  return new MobiscrollConnectClient({
    apiKey: accessToken,
    baseURL: process.env.MOBISCROLL_CONNECT_URL,
    timeout: 30000,
  });
}
