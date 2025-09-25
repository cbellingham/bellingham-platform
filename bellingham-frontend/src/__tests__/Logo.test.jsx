/* eslint-env jest */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logo from '../components/Logo';

test('renders nothing while logo is disabled', () => {
  const { container } = render(<Logo />);
  expect(container.firstChild).toBeNull();
});
