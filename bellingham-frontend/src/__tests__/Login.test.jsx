import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';

test('renders username and password fields', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});
