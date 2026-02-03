import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'token-store.json');

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export function saveTokens(tokens: Tokens) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Failed to save tokens to file:', error);
  }
}

export function loadTokens(): Tokens | null {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load tokens from file:', error);
  }
  return null;
}

export function clearTokens() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
    }
  } catch (error) {
    console.error('Failed to clear tokens file:', error);
  }
}
