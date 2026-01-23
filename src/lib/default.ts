const isDev = process.env.NODE_ENV !== 'production';

export const defaultConfig = {
  mobiscrollClientId: isDev ? process.env.NEXT_PUBLIC_MOBISCROLL_CLIENT_ID_DEV : process.env.NEXT_PUBLIC_MOBISCROLL_CLIENT_ID,
  mobiscrollClientSecret: isDev ? process.env.NEXT_PUBLIC_MOBISCROLL_CLIENT_SECRET_DEV : process.env.NEXT_PUBLIC_MOBISCROLL_CLIENT_SECRET,
  mobiscrollRedirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
};
