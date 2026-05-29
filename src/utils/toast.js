import { toast } from 'sonner';

/**
 * Custom styled toast wrapper for uniform alerts across the app
 */
export const showToast = {
  success: (message, description = '') => {
    toast.success(message, {
      description,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #10b981',
        color: '#f8fafc',
        backdropFilter: 'blur(8px)',
      },
    });
  },

  error: (message, description = '') => {
    toast.error(message, {
      description,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #ef4444',
        color: '#f8fafc',
        backdropFilter: 'blur(8px)',
      },
    });
  },

  warning: (message, description = '') => {
    toast.warning(message, {
      description,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #f59e0b',
        color: '#f8fafc',
        backdropFilter: 'blur(8px)',
      },
    });
  },

  info: (message, description = '') => {
    toast.info(message, {
      description,
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #3b82f6',
        color: '#f8fafc',
        backdropFilter: 'blur(8px)',
      },
    });
  },
};
