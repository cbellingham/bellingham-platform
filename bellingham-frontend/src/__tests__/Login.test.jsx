/* eslint-env jest */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';
import { AuthProvider } from '../context';

test('renders username and password fields', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
  expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});
