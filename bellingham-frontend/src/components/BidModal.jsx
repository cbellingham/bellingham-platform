import React, { useState } from 'react';
import Button from './ui/Button';

const BidModal = ({ onConfirm, onCancel, initialBid = '' }) => {
  const [bidAmount, setBidAmount] = useState(initialBid);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setBidAmount(event.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = () => {
    const parsedAmount = Number(bidAmount);

    if (bidAmount === '') {
      setError('Please enter a bid amount.');
      return;
    }

    if (Number.isNaN(parsedAmount)) {
      setError('Bid amount must be a valid number.');
      return;
    }

    if (parsedAmount <= 0) {
      setError('Bid amount must be greater than zero.');
      return;
    }

    onConfirm(parsedAmount);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold">Submit a Bid</h2>
        <label htmlFor="bid-amount" className="mt-4 block text-sm font-medium text-gray-700">
          Bid Amount
        </label>
        <input
          id="bid-amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={bidAmount}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="mt-1 w-full rounded border border-gray-300 p-2"
          placeholder="Enter your bid"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Submit Bid
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BidModal;
