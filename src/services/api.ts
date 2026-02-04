import axios from 'axios';

// We need a way to access the refreshAccessToken and logout functions from AuthContext
// This is a common pattern to avoid circular dependencies between axios interceptors and context
// by creating a mutable object that can be updated with the context functions.
// This will be initialized in AuthContext.tsx
export const authService = {
  refreshAccessToken: (() => Promise.resolve(false)) as () => Promise<boolean>,
  logout: (() => Promise.resolve()) as () => Promise<void>,
};

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
if (!apiBaseUrl) {
  throw new Error('VITE_API_URL is not set.');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: any }[] = [];

const processQueue = (error: any | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

const isPublicAuthRoute = (url?: string) => {
  if (!url) return false;
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/verify-reset-token',
    '/auth/reset-password',
    '/auth/google',
    '/auth/google/callback',
  ];
  return publicRoutes.some((route) => url.includes(route));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error response is 401 and it's not a refresh token request
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/auth/refresh' &&
      !isPublicAuthRoute(originalRequest.url)
    ) {
      // Prevent multiple refresh token requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then((response) => response)
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const refreshed = await authService.refreshAccessToken(); // Call the refresh function from AuthContext
          if (refreshed) {
            processQueue(null);
            resolve(api(originalRequest));
          } else {
            // Refresh token failed, clear all tokens and redirect to login
            processQueue(error); // Reject all pending requests
            authService.logout(); // Call logout from AuthContext
            reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError); // Reject all pending requests
          authService.logout(); // Call logout from AuthContext
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    // If the error is 401 and it IS the refresh token request, it means refresh failed.
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      authService.logout();
    }

    return Promise.reject(error);
  }
);

export default api;
