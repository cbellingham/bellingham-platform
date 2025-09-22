import { afterEach, describe, expect, test, vi } from 'vitest';
import api from '../utils/api';

describe('api utility', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('requests include credentials for cookie-based auth', async () => {
    await api.get('/test', {
      adapter: (config) => {
        expect(config.withCredentials).toBe(true);
        expect(config.headers.Authorization).toBeUndefined();
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
      },
    });
  });

  test('dispatches session-expired event on 401 responses', async () => {
    const listener = vi.fn();
    window.addEventListener('session-expired', listener);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = {
      response: { status: 401 },
      config: {},
      isAxiosError: true,
      toJSON: () => ({}),
    };

    await expect(api.get('/test', {
      adapter: () => Promise.reject(error),
    })).rejects.toEqual(error);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '[api] Unauthorized response received; dispatching session-expired event.',
    );
    expect(console.error).toHaveBeenCalledWith('[api] Request failed', {
      method: undefined,
      message: undefined,
      status: 401,
      url: undefined,
    });
    window.removeEventListener('session-expired', listener);
  });

  test('retries retryable errors up to the configured limit', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let attempt = 0;
    const adapter = vi.fn((config) => {
      attempt += 1;
      if (attempt === 1) {
        const error = new Error('Server error');
        error.config = config;
        error.response = { status: 502 };
        error.isAxiosError = true;
        error.toJSON = () => ({});
        return Promise.reject(error);
      }

      return Promise.resolve({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    });

    const response = await api.get('/retry-test', { adapter, retry: 2 });

    expect(response.status).toBe(200);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  test('logs error details when retries are exhausted', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const adapter = vi.fn((config) => {
      const error = new Error('Bad Gateway');
      error.config = config;
      error.response = { status: 502 };
      error.isAxiosError = true;
      error.toJSON = () => ({});
      return Promise.reject(error);
    });

    await expect(
      api.get('/retry-test', {
        adapter,
        retry: 1,
      }),
    ).rejects.toMatchObject({ response: { status: 502 } });

    expect(adapter).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('[api] Request failed', {
      method: 'get',
      message: 'Bad Gateway',
      status: 502,
      url: '/retry-test',
    });
  });
});
