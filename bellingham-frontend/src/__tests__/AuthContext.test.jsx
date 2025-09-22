import { describe, expect, test, vi } from 'vitest';

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context';
import api from '../utils/api';

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: {} });
    api.post.mockResolvedValue({ data: {} });
  });

  test('login and logout update context and persistent storage', async () => {
    const futureExpiry = new Date(Date.now() + 60_000).toISOString();

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.login({ username: 'user', expiresAt: futureExpiry });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe('user');
    expect(localStorage.getItem('auth.username')).toBe('user');
    expect(localStorage.getItem('auth.expiresAt')).toBe(futureExpiry);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.username).toBeNull();
    expect(localStorage.getItem('auth.username')).toBeNull();
    expect(localStorage.getItem('auth.expiresAt')).toBeNull();
    expect(api.post).toHaveBeenCalledWith('/api/logout');
  });
});
