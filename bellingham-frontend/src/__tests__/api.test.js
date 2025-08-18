/* eslint-env jest */
import api from '../utils/api';

test('attaches auth header when token exists', async () => {
  localStorage.setItem('token', 'testtoken');
  await api.get('/test', {
    adapter: (config) => {
      expect(config.headers.Authorization).toBe('Bearer testtoken');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    },
  });
});

test('does not attach auth header when token missing', async () => {
  localStorage.removeItem('token');
  await api.get('/test', {
    adapter: (config) => {
      expect(config.headers.Authorization).toBeUndefined();
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    },
  });
});
