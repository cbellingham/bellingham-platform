/* eslint-env jest */
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import api from '../utils/api';
import Login from '../components/Login';
import { AuthProvider } from '../context';

vi.mock('../utils/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
  setAuthToken: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('renders username and password fields', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
  expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});

test('allows toggling password visibility', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const toggleButton = screen.getByRole('button', { name: /show password/i });

  expect(passwordInput).toHaveAttribute('type', 'password');

  fireEvent.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'text');
  expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
});

test('highlights fields when authentication fails', async () => {
  api.post.mockRejectedValueOnce({ response: { status: 403 } });

  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'user' } });
  fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });

  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/Invalid username or password\./i)).toBeInTheDocument();

  expect(screen.getByPlaceholderText(/enter your username/i)).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByPlaceholderText(/enter your password/i)).toHaveAttribute('aria-invalid', 'true');
});
