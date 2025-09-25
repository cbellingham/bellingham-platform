import React from 'react';
import Button from './ui/Button';

const styles = {
  info: 'bg-slate-900/80 text-slate-100 border-slate-700/80',
  success: 'bg-emerald-900/80 text-emerald-100 border-emerald-700/80',
  error: 'bg-rose-900/80 text-rose-100 border-rose-700/80',
  warning: 'bg-amber-900/80 text-amber-100 border-amber-700/80',
};

const NotificationBanner = ({ type = 'info', message, onDismiss }) => {
  if (!message) {
    return null;
  }

  const tone = styles[type] || styles.info;

  return (
    <div className={`mb-4 flex items-start gap-4 rounded border px-4 py-3 text-base font-medium shadow-sm backdrop-blur ${tone}`}>
      <span className="flex-1 leading-relaxed">{message}</span>
      {onDismiss && (
        <Button
          variant="link"
          onClick={onDismiss}
          className="text-current font-semibold hover:text-white/90"
        >
          Dismiss
        </Button>
      )}
    </div>
  );
};

export default NotificationBanner;
