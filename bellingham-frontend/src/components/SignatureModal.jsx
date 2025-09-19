import React, { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import Button from './ui/Button';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;

const SignatureModal = ({ onConfirm, onCancel }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const setupCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = CANVAS_WIDTH * ratio;
      canvas.height = CANVAS_HEIGHT * ratio;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;

      let context = null;
      try {
        context = canvas.getContext('2d');
      } catch (err) {
        context = null;
      }

      if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(ratio, ratio);
      }
    };

    setupCanvas();

    const signaturePad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 2.5,
      penColor: '#000000',
      backgroundColor: '#ffffff',
    });

    signaturePadRef.current = signaturePad;

    const handleResize = () => {
      setupCanvas();
      signaturePad.clear();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (signaturePadRef.current) {
        if (typeof signaturePadRef.current.off === 'function') {
          signaturePadRef.current.off();
        }
        signaturePadRef.current = null;
      }
    };
  }, []);

  const handleClear = () => {
    const pad = signaturePadRef.current;
    if (!pad) {
      return;
    }
    pad.clear();
    setError('');
  };

  const handleSave = () => {
    const pad = signaturePadRef.current;
    if (!pad) {
      setError('Please provide your signature before saving.');
      return;
    }

    if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
      setError('Please provide your signature before saving.');
      return;
    }

    setError('');
    const data = pad.toDataURL('image/png');
    onConfirm(data);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-md">
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          width={400}
          height={200}
          data-testid="signature-canvas"
        />
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClear}>Clear</Button>
          <Button variant="danger" onClick={onCancel}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
