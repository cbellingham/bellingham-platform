import React from 'react';
import { vi } from 'vitest';

export default React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    clear: vi.fn(),
    isEmpty: () => false,
    toDataURL: () => 'mock-data-url',
  }));
  return <canvas {...props.canvasProps} data-testid="signature-canvas" />;
});
