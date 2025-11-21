/* eslint-env jest */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logo from '../components/Logo';

test('renders the logo asset with accessible alt text', () => {
  const { getByAltText } = render(<Logo />);
  const logo = getByAltText('Bellingham Data Futures logo');
  expect(logo).toBeInTheDocument();
  expect(logo).toHaveAttribute('src');
});
