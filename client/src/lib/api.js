const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

// Debug logging for production
console.log('[API Config] Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  API_BASE_URL: API_BASE_URL,
  mode: import.meta.env.MODE
});

/**
 * Extract JWT token from Clerk token object or string
 * @param {string|object} token - Clerk token (can be string or object with jwt property)
 * @returns {string|null} - The JWT token string
 */
const extractToken = (token) => {
  if (!token) return null;
  
  // If it's already a string, return it
  if (typeof token === 'string') {
    return token;
  }
  
  // If it's an object, extract the jwt property
  if (typeof token === 'object' && token.jwt) {
    return token.jwt;
  }
  
  // If it's an object but no jwt property, try to stringify or return null
  return null;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/show/add-show')
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {string|object} token - Clerk authentication token (string or object with jwt property)
 */
export const apiRequest = async (endpoint, options = {}, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Extract and add authorization header if token is provided
  const jwtToken = extractToken(token);
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  const config = {
    ...options,
    headers,
    mode: 'cors', // Explicitly set CORS mode
    credentials: 'include', // Include credentials to match server CORS config
  };

  try {
    const response = await fetch(url, config);
    
    // Handle CORS and network errors
    if (!response.ok && response.status === 0) {
      throw new Error('CORS error: Unable to connect to the server. Make sure the backend is running and CORS is configured correctly.');
    }

    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: ${error.message}. Check if the backend server is running at ${url}`);
    }
    throw error;
  }
};

/**
 * Hook to make authenticated API requests
 * Use this in components that need to make API calls
 * Must be called from within a ClerkProvider context
 * 
 * Example usage:
 * const { authenticatedRequest } = useApi();
 * const data = await authenticatedRequest('/api/show/add-show', { method: 'POST', body: {...} });
 */
export const useApi = () => {
  // This will be imported in components that use it
  // Components should import useAuth directly from @clerk/clerk-react
  return {
    // This is a placeholder - components should use useAuth directly
    // See AddShows.jsx for example usage
  };
};

export default {
  apiRequest,
  useApi,
};
