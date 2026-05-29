import { toast } from 'sonner';

// Keep track of recent toast messages to prevent duplicates
const recentToasts = new Map();
const DEDUPE_TIMEOUT = 500; // milliseconds

const shouldShow = (message) => {
  if (!message) return true;
  const now = Date.now();
  const lastTime = recentToasts.get(message);
  if (lastTime && now - lastTime < DEDUPE_TIMEOUT) {
    return false;
  }
  recentToasts.set(message, now);

  // Periodic cleanup of Map size to avoid memory growth
  if (recentToasts.size > 50) {
    for (const [key, val] of recentToasts.entries()) {
      if (now - val > DEDUPE_TIMEOUT) {
        recentToasts.delete(key);
      }
    }
  }
  return true;
};

/**
 * Custom styled toast wrapper for uniform alerts across the app
 */
export const showToast = {
  success: (message, description = '') => {
    if (!shouldShow(message)) return;
    toast.success(message, {
      description,
      style: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #10b981',
        color: '#0f172a',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    });
  },

  error: (message, description = '') => {
    if (!shouldShow(message)) return;
    toast.error(message, {
      description,
      style: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ef4444',
        color: '#0f172a',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    });
  },

  warning: (message, description = '') => {
    if (!shouldShow(message)) return;
    toast.warning(message, {
      description,
      style: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #f59e0b',
        color: '#0f172a',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    });
  },

  info: (message, description = '') => {
    if (!shouldShow(message)) return;
    toast.info(message, {
      description,
      style: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #3b82f6',
        color: '#0f172a',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    });
  },
};
