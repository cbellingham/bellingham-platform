import React from 'react';
import Button from './ui/Button';

const styles = {
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const NotificationBanner = ({ type = 'info', message, onDismiss }) => {
  if (!message) {
    return null;
  }

  const tone = styles[type] || styles.info;

  return (
    <div className={`mb-4 flex items-center justify-between rounded border px-4 py-3 text-sm ${tone}`}>
      <span>{message}</span>
      {onDismiss && (
        <Button variant="link" onClick={onDismiss} className="text-current">
          Dismiss
        </Button>
      )}
    </div>
  );
};

export default NotificationBanner;
