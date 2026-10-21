import { WhopClient } from '@whop/sdk';

const whopApiKey = process.env.WHOP_COMPANY_API_KEY;

if (!whopApiKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WHOP_COMPANY_API_KEY is not defined in environment variables.');
}

export const whop = new WhopClient({
  token: whopApiKey || 'placeholder_key_not_configured',
});
