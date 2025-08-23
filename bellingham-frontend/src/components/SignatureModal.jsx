import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from './ui/Button';

const SignatureModal = ({ onConfirm, onCancel }) => {
  const sigRef = useRef(null);

  const handleClear = () => {
    sigRef.current && sigRef.current.clear();
  };

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const data = sigRef.current.toDataURL();
      onConfirm(data);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-md">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{ width: 400, height: 200, className: 'border border-gray-300' }}
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
