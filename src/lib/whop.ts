import { WhopClient } from '@whop/sdk';

if (!process.env.WHOP_COMPANY_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WHOP_COMPANY_API_KEY is not defined in environment variables.');
}

export const whop = new WhopClient({
  token: process.env.WHOP_COMPANY_API_KEY || 'mock_whop_key',
});
