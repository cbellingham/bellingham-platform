import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SignatureModal from '../components/SignatureModal';

vi.mock('signature_pad');
import SignaturePad from 'signature_pad';

const clearSpy = vi.spyOn(SignaturePad.prototype, 'clear');
const isEmptySpy = vi.spyOn(SignaturePad.prototype, 'isEmpty');
const toDataURLSpy = vi.spyOn(SignaturePad.prototype, 'toDataURL');

const originalGetContext = HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    scale: vi.fn(),
  }));
});

beforeEach(() => {
  clearSpy.mockClear();
  isEmptySpy.mockReset().mockReturnValue(false);
  toDataURLSpy.mockReset().mockReturnValue('mock-data-url');
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

test('invokes handlers for actions', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<SignatureModal onConfirm={onConfirm} onCancel={onCancel} />);

  fireEvent.click(screen.getByText('Save'));
  expect(isEmptySpy).toHaveBeenCalled();
  expect(onConfirm).toHaveBeenCalledWith('mock-data-url');

  fireEvent.click(screen.getByText('Continue without signature'));
  expect(onConfirm).toHaveBeenCalledWith(null);

  fireEvent.click(screen.getByText('Cancel'));
  expect(onCancel).toHaveBeenCalled();

  fireEvent.click(screen.getByText('Clear'));
  expect(clearSpy).toHaveBeenCalled();
});

test('displays error if attempting to save without a signature', () => {
  isEmptySpy.mockReturnValue(true);
  const onConfirm = vi.fn();
  render(<SignatureModal onConfirm={onConfirm} onCancel={vi.fn()} />);

  fireEvent.click(screen.getByText('Save'));

  expect(onConfirm).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('Please provide your signature before saving.');
});
