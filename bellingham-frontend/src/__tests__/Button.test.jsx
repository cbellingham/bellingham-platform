import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Button from '../components/ui/Button';

test('applies variant classes', () => {
  render(
    <div>
      <Button>Primary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
  expect(screen.getByText('Primary')).toHaveClass('bg-[#00D1FF]');
  expect(screen.getByText('Danger')).toHaveClass('bg-red-600');
  expect(screen.getByText('Ghost')).toHaveClass('bg-gray-600');
});

test('handles click events', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

