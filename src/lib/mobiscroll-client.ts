import { MobiscrollConnectClient } from '@mobiscroll/connect-sdk';
import { defaultConfig } from './default';
import { loadTokens, saveTokens, clearTokens } from './token-storage';

let globalClient: MobiscrollConnectClient | null = null;

/**
 * Get a Mobiscroll Connect client instance
 * This should ONLY be used in server-side code (API routes, Server Components, Server Actions)
 * NEVER expose client secret to the browser
 */
export function getMobiscrollClient() {
  if (globalClient) {
    return globalClient;
  }

  const clientId = defaultConfig.mobiscrollClientId;
  const clientSecret = defaultConfig.mobiscrollClientSecret;
  const redirectUri = defaultConfig.mobiscrollRedirectUri;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Mobiscroll Connect credentials in environment variables');
  }

  globalClient = new MobiscrollConnectClient({
    clientId,
    clientSecret,
    redirectUri,
  });

  const storedTokens = loadTokens();
  if (storedTokens) {
    globalClient.setCredentials(storedTokens);
  }

  globalClient.on('tokens', (tokens) => {
    saveTokens(tokens);
  });

  return globalClient;
}

export function resetMobiscrollClient() {
  globalClient = null;
  clearTokens();
}

