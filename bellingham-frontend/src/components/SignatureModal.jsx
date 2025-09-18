import React, { useEffect, useRef, useState } from 'react';
import Button from './ui/Button';

const SignatureModal = ({ onConfirm, onCancel }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isEmptyRef = useRef(true);
  const ratioRef = useRef(1);
  const [error, setError] = useState('');

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

      ratioRef.current = ratio;
      isEmptyRef.current = true;
    };

    resizeCanvas();

    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      contextRef.current = context;
    }

    const getPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = ratioRef.current;
      return {
        x: (event.clientX - rect.left) * ratio,
        y: (event.clientY - rect.top) * ratio,
      };
    };

    const handlePointerDown = (event) => {
      if (!contextRef.current) return;
      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }
      const { x, y } = getPoint(event);
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      isDrawingRef.current = true;
    };

    const handlePointerMove = (event) => {
      if (!isDrawingRef.current || !contextRef.current) return;
      const { x, y } = getPoint(event);
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      isEmptyRef.current = false;
    };

    const endDrawing = (event) => {
      if (!isDrawingRef.current || !contextRef.current) return;
      handlePointerMove(event);
      contextRef.current.closePath();
      isDrawingRef.current = false;
      if (
        canvas.releasePointerCapture &&
        canvas.hasPointerCapture &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', endDrawing);
    canvas.addEventListener('pointerleave', endDrawing);
    canvas.addEventListener('pointercancel', endDrawing);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', endDrawing);
      canvas.removeEventListener('pointerleave', endDrawing);
      canvas.removeEventListener('pointercancel', endDrawing);
      contextRef.current = null;
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    isEmptyRef.current = true;
    setError('');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isEmptyRef.current) {
      setError('Please provide your signature before saving.');
      return;
    }

    setError('');
    const data = canvas.toDataURL('image/png');
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
