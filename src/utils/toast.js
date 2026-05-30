import React from 'react';
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
 * Render a customized premium toast using React.createElement for JS file compatibility
 */
const renderCustomToast = (type, message, description = '') => {
  let bgColor = '';
  let textColor = '#ffffff';
  let crossHoverColor = 'rgba(255, 255, 255, 0.15)';
  
  if (type === 'success') {
    bgColor = '#10b981'; // Solid green background
  } else if (type === 'error') {
    bgColor = '#ef4444'; // Solid red background
  } else if (type === 'warning') {
    bgColor = '#f59e0b'; // Solid yellow/amber background
  } else {
    bgColor = '#3b82f6'; // Solid blue background
  }

  toast.custom((id) => (
    React.createElement('div', {
      className: 'flex w-[356px] rounded-xl overflow-hidden shadow-lg border-0',
      style: {
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
      }
    },
      // Cancel button (20% of total width, to the most left)
      React.createElement('button', {
        onClick: () => toast.dismiss(id),
        className: 'w-[20%] flex items-center justify-center border-r border-white/20 transition-colors duration-150 outline-none cursor-pointer text-center py-4',
        style: {
          background: 'none',
          borderTop: '0',
          borderBottom: '0',
          borderLeft: '0',
          color: textColor,
        },
        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = crossHoverColor; },
        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; },
        title: 'Close'
      },
        React.createElement('span', { className: 'text-base font-bold' }, '✕')
      ),
      // Message and Description Content (80% of total width, to the right)
      React.createElement('div', {
        className: 'w-[80%] p-4 flex flex-col justify-center text-left'
      },
        React.createElement('div', { className: 'text-xs sm:text-sm font-semibold leading-tight' }, message),
        description ? React.createElement('div', { className: 'text-[10px] sm:text-xs mt-1 opacity-90 leading-snug' }, description) : null
      )
    )
  ));
};

/**
 * Custom styled toast wrapper for uniform alerts across the app
 */
export const showToast = {
  success: (message, description = '') => {
    if (!shouldShow(message)) return;
    renderCustomToast('success', message, description);
  },

  error: (message, description = '') => {
    if (!shouldShow(message)) return;
    renderCustomToast('error', message, description);
  },

  warning: (message, description = '') => {
    if (!shouldShow(message)) return;
    renderCustomToast('warning', message, description);
  },

  info: (message, description = '') => {
    if (!shouldShow(message)) return;
    renderCustomToast('info', message, description);
  },
};
