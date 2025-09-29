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
      } catch {
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
      penColor: '#f9fafb',
      backgroundColor: '#0f172a',
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

  const handleConfirmWithoutSignature = () => {
    setError('');
    onConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-white">Capture signature</h2>
          <p className="mt-1 text-sm text-slate-300">
            Use your pointer or touch to draw your signature below. When you are satisfied, save it to continue.
          </p>
        </header>
        <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto w-full max-w-md rounded-lg border border-slate-700 bg-slate-900"
            width={400}
            height={200}
            data-testid="signature-canvas"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" className="border border-slate-600/60 bg-slate-800 text-slate-100 hover:bg-slate-700" onClick={handleClear}>Clear</Button>
          <Button variant="danger" className="shadow-lg shadow-red-900/40" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            className="font-semibold shadow-lg shadow-[#00D1FF]/25"
            onClick={handleConfirmWithoutSignature}
          >
            Continue without signature
          </Button>
          <Button variant="success" className="font-semibold shadow-lg shadow-[#00D1FF]/25" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
