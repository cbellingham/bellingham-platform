/* eslint-env jest */
/* global test, expect, beforeEach */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context/AuthContext';

beforeEach(() => {
  localStorage.clear();
});

test('login and logout update context and localStorage', () => {
  const { result } = renderHook(() => React.useContext(AuthContext), {
    wrapper: AuthProvider,
  });

  act(() => {
    result.current.login('abc', 'user');
  });
  expect(result.current.token).toBe('abc');
  expect(result.current.username).toBe('user');
  expect(localStorage.getItem('token')).toBe('abc');
  expect(localStorage.getItem('username')).toBe('user');

  act(() => {
    result.current.logout();
  });
  expect(result.current.token).toBe(null);
  expect(result.current.username).toBe(null);
  expect(localStorage.getItem('token')).toBe(null);
  expect(localStorage.getItem('username')).toBe(null);
});
