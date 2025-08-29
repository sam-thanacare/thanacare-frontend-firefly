export interface TokenPayload {
  user_id: string;
  email: string;
  role: string;
  name?: string;
  exp: number;
  iat: number;
}

/**
 * Decodes a JWT token and returns the payload
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Checks if a token will expire soon (within 5 minutes)
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdMinutes: number = 5
): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdSeconds = thresholdMinutes * 60;
  return payload.exp - currentTime < thresholdSeconds;
}

/**
 * Gets the remaining time until token expiration in seconds
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
}

/**
 * Clears all stored authentication tokens
 */
export function clearStoredTokens(): void {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
}

/**
 * Gets the stored token, checking localStorage first (remember me) then sessionStorage
 */
export function getStoredToken(): string | null {
  return (
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  );
}

/**
 * Gets the stored token and indicates which storage it came from
 */
export function getStoredTokenWithSource(): {
  token: string | null;
  source: 'localStorage' | 'sessionStorage' | null;
} {
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');

  console.log('getStoredTokenWithSource called:', {
    hasLocalToken: !!localToken,
    hasSessionToken: !!sessionToken,
  });

  if (localToken) {
    console.log('Returning token from localStorage');
    return { token: localToken, source: 'localStorage' };
  } else if (sessionToken) {
    console.log('Returning token from sessionStorage');
    return { token: sessionToken, source: 'sessionStorage' };
  }

  console.log('No token found in storage');
  return { token: null, source: null };
}

/**
 * Stores a token based on remember me preference
 */
export function storeToken(token: string, rememberMe: boolean): void {
  console.log('storeToken called:', { rememberMe, hasToken: !!token });

  // Clear any existing tokens first
  clearStoredTokens();

  if (rememberMe) {
    localStorage.setItem('authToken', token);
    console.log('Token stored in localStorage (remember me enabled)');
  } else {
    sessionStorage.setItem('authToken', token);
    console.log('Token stored in sessionStorage (remember me disabled)');
  }
}
