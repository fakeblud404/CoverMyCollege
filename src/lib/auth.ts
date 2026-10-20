import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

const USER_COOKIE_NAME = 'cmc_uid';

/**
 * Retrieves the authenticated user from the request.
 * Prioritizes:
 * 1. Authorization header (Bearer token / User ID)
 * 2. 'x-user-id' custom header
 * 3. HTTP-only session cookie 'cmc_uid'
 * 4. Generates a stable session ID cookie if absent
 */
export function getAuthenticatedUser(request: NextRequest): { user: AuthenticatedUser; isNewSession: boolean } {
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return { user: { id: token }, isNewSession: false };
    }
  }

  // Check custom header
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && headerUserId.trim()) {
    return { user: { id: headerUserId.trim() }, isNewSession: false };
  }

  // Check cookie
  const cookieUserId = request.cookies.get(USER_COOKIE_NAME)?.value;
  if (cookieUserId && cookieUserId.trim()) {
    return { user: { id: cookieUserId.trim() }, isNewSession: false };
  }

  // Generate new anonymous/session user ID
  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return { user: { id: newUserId }, isNewSession: true };
}

/**
 * Attach user session cookie to response if it was newly created.
 */
export function attachUserCookie(response: NextResponse, userId: string): NextResponse {
  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return response;
}
