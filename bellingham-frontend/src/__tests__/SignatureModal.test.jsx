import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SignatureModal from '../components/SignatureModal';

const originalCanvasProps = {
  getContext: HTMLCanvasElement.prototype.getContext,
  toDataURL: HTMLCanvasElement.prototype.toDataURL,
  getBoundingClientRect: HTMLCanvasElement.prototype.getBoundingClientRect,
  setPointerCapture: HTMLCanvasElement.prototype.setPointerCapture,
  releasePointerCapture: HTMLCanvasElement.prototype.releasePointerCapture,
  hasPointerCapture: HTMLCanvasElement.prototype.hasPointerCapture,
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    lineCap: 'round',
    lineJoin: 'round',
    strokeStyle: 'black',
    lineWidth: 2,
  }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'mock-data-url');
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    width: 400,
    height: 200,
  }));
  HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
  HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
  HTMLCanvasElement.prototype.hasPointerCapture = vi.fn(() => true);
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalCanvasProps.getContext;
  HTMLCanvasElement.prototype.toDataURL = originalCanvasProps.toDataURL;
  HTMLCanvasElement.prototype.getBoundingClientRect =
    originalCanvasProps.getBoundingClientRect;
  HTMLCanvasElement.prototype.setPointerCapture =
    originalCanvasProps.setPointerCapture;
  HTMLCanvasElement.prototype.releasePointerCapture =
    originalCanvasProps.releasePointerCapture;
  HTMLCanvasElement.prototype.hasPointerCapture =
    originalCanvasProps.hasPointerCapture;
});

test('invokes handlers for actions', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<SignatureModal onConfirm={onConfirm} onCancel={onCancel} />);
  const canvas = screen.getByTestId('signature-canvas');

  fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 });
  fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
  fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 });

  fireEvent.click(screen.getByText('Save'));
  expect(onConfirm).toHaveBeenCalledWith('mock-data-url');
  fireEvent.click(screen.getByText('Cancel'));
  expect(onCancel).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Clear'));
  expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
});
