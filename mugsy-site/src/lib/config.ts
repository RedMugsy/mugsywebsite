// Environment configuration utility
export const config = {
  // API Base URL - defaults to empty string for relative URLs in production
  API_BASE: import.meta.env.VITE_API_BASE || '',
  
  // Development mode
  DEV: import.meta.env.DEV,
  
  // Build mode
  PROD: import.meta.env.PROD,
} as const;

// Helper to get the full API URL
export function getApiUrl(endpoint: string): string {
  const base = config.API_BASE.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export default config;