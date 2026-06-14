import type { StringValue } from 'ms';
import 'dotenv/config';

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN! as StringValue,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI!,
  },

  frontendUrl: process.env.FRONTEND_URL!, 
};
