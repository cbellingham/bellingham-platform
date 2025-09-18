import React, { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import Button from './ui/Button';

const SignatureModal = ({ onConfirm, onCancel }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    const width = 400;
    const height = 200;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(ratio, ratio);
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();

    const signaturePad = new SignaturePad(canvas, {
      penColor: 'black',
    });

    signaturePadRef.current = signaturePad;

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      signaturePad.off();
      signaturePadRef.current = null;
    };
  }, []);

  const handleClear = () => {
    signaturePadRef.current && signaturePadRef.current.clear();
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const data = signaturePadRef.current.toDataURL();
      onConfirm(data);
    }
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
