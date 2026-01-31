/**
 * Utility function to get Clerk token for Postman testing
 * 
 * Usage:
 * 1. Open your browser console on your app (http://localhost:5173 or your frontend URL)
 * 2. Make sure you're signed in
 * 3. Paste this code in the console:
 * 
 * import('https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js').then(async (Clerk) => {
 *   const clerk = new Clerk.default('YOUR_PUBLISHABLE_KEY');
 *   await clerk.load();
 *   const token = await clerk.session.getToken();
 *   console.log('Your token:', token);
 *   console.log('Copy this token and use it in Postman Authorization header as: Bearer ' + token);
 * });
 * 
 * OR simpler method - if you're using Clerk React:
 * 
 * In your browser console, after signing in:
 * window.__clerk_token = await window.Clerk?.session?.getToken();
 * console.log('Token:', window.__clerk_token);
 */

// This file is just for reference - use the browser console method below
