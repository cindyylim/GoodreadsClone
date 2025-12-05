/**
 * Cookie utility functions for managing browser cookies
 */

/**
 * Set a cookie with the given name, value, and options
 * @param name - The name of the cookie
 * @param value - The value of the cookie
 * @param days - Number of days until the cookie expires (default: 7)
 * @param path - The path for the cookie (default: '/')
 */
export const setCookie = (name: string, value: string, days: number = 7, path: string = '/') => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const expiresString = `expires=${expires.toUTCString()}`;
  document.cookie = `${name}=${value};${expiresString};path=${path}`;
};

/**
 * Get the value of a cookie by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

/**
 * Remove a cookie by setting its expiration to the past
 * @param name - The name of the cookie to remove
 * @param path - The path of the cookie (default: '/')
 */
export const removeCookie = (name: string, path: string = '/') => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`;
};

/**
 * Check if a cookie exists
 * @param name - The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};