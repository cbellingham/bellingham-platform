import { describe, expect, test, vi } from 'vitest';
import api from '../utils/api';

describe('api utility', () => {
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
    window.removeEventListener('session-expired', listener);
  });
});
