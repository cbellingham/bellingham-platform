import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const parseRetryCount = (value, fallback) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  }

  return fallback;
};

const DEFAULT_MAX_RETRIES = parseRetryCount(import.meta.env.VITE_API_MAX_RETRIES, 1);

const shouldRetryRequest = (error, maxRetries) => {
  const { config, response } = error ?? {};

  if (!config) {
    return false;
  }

  const currentRetryCount = config.__retryCount ?? 0;
  if (currentRetryCount >= maxRetries) {
    return false;
  }

  if (response) {
    return response.status >= 500 && response.status < 600;
  }

  // Retry network errors (no response received)
  return true;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error ?? {};

    if (response?.status === 401 && typeof window !== 'undefined') {
      console.warn('[api] Unauthorized response received; dispatching session-expired event.');
      window.dispatchEvent(new Event('session-expired'));
    }

    if (config) {
      const maxRetries = parseRetryCount(config.retry, DEFAULT_MAX_RETRIES);

      if (shouldRetryRequest(error, maxRetries)) {
        config.__retryCount = (config.__retryCount ?? 0) + 1;
        console.warn(
          `[api] Retry attempt ${config.__retryCount}/${maxRetries} for ${
            config.method?.toUpperCase() ?? 'REQUEST'
          } ${config.url ?? ''}.`,
        );

        return api(config);
      }
    }

    console.error('[api] Request failed', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      message: error?.message,
    });

    return Promise.reject(error);
  },
);

export default api;
