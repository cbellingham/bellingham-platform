import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SignatureModal from '../components/SignatureModal';

// Provide a mock implementation for the signature canvas library so the
// component can be tested without requiring the actual dependency or DOM APIs.
vi.mock('react-signature-canvas');

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
