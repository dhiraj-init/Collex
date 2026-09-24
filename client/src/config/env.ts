/**
 * Client Environment Configuration
 */

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
