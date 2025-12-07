// API Configuration for Red Mugsy Treasure Hunt
export const API_CONFIG = {
  // Railway Production Backend
  BASE_URL: 'https://red-mugsy-treasure-hunt-backend-production.up.railway.app',
  
  ENDPOINTS: {
    // Health check
    HEALTH: '/health',
    
    // Authentication
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_REFRESH: '/api/auth/refresh',
    AUTH_LOGOUT: '/api/auth/logout',
    
    // Participants
    PARTICIPANTS_REGISTER: '/api/participants/register',
    PARTICIPANTS_PROFILE: '/api/participants/profile',
    
    // Promoters
    PROMOTERS_REGISTER: '/api/promoters/register',
    PROMOTERS_PROFILE: '/api/promoters/profile',
    
    // Admin
    ADMIN_PARTICIPANTS: '/api/admin/participants',
    ADMIN_PROMOTERS: '/api/admin/promoters',
    
    // Payments
    PAYMENTS_CREATE: '/api/payments/create-session'
  }
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function for API requests with error handling
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint)
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}