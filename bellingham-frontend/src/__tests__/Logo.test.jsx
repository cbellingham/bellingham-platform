import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logo from '../components/Logo';

test('renders logo image', () => {
  render(<Logo />);
  const img = screen.getByAltText(/logo/i);
  expect(img).toBeInTheDocument();
});
