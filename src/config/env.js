export const config = {
  API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL,
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'accessToken',
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refreshToken',
  ROLE_KEY: import.meta.env.VITE_ROLE_KEY || 'role',
};

export const validateEnv = () => {
  const required = ['VITE_APP_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
};