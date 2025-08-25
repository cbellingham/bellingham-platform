import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SignatureModal from '../components/SignatureModal';

vi.mock('react-signature-canvas', () => ({
  default: React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      clear: vi.fn(),
      isEmpty: () => false,
      toDataURL: () => 'mock-data-url',
    }));
    return <canvas {...props.canvasProps} data-testid="signature-canvas" />;
  }),
}));

test('invokes handlers for actions', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<SignatureModal onConfirm={onConfirm} onCancel={onCancel} />);
  fireEvent.click(screen.getByText('Save'));
  expect(onConfirm).toHaveBeenCalledWith('mock-data-url');
  fireEvent.click(screen.getByText('Cancel'));
  expect(onCancel).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Clear'));
  expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
});
