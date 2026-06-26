import React from "react";
import { toast } from "sonner";

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
const renderCustomToast = (type, message, description = "") => {
  let bgColor = "";
  let borderColor = "";
  let textColor = "";
  let crossHoverColor = "";

  if (type === "success") {
    bgColor = "#f0fdf4"; // bg-green-50
    borderColor = "#bbf7d0"; // border-green-200
    textColor = "#15803d"; // text-green-750
    crossHoverColor = "rgba(21, 128, 61, 0.08)";
  } else if (type === "error") {
    bgColor = "#fef2f2"; // bg-red-50
    borderColor = "#fca5a5"; // border-red-200
    textColor = "#b91c1c"; // text-red-750
    crossHoverColor = "rgba(185, 28, 28, 0.08)";
  } else if (type === "warning") {
    bgColor = "#fffbeb"; // bg-amber-50
    borderColor = "#fde68a"; // border-amber-200
    textColor = "#b45309"; // text-amber-750
    crossHoverColor = "rgba(180, 83, 9, 0.08)";
  } else {
    bgColor = "#eff6ff"; // bg-blue-50
    borderColor = "#bfdbfe"; // border-blue-200
    textColor = "#1d4ed8"; // text-blue-750
    crossHoverColor = "rgba(29, 78, 216, 0.08)";
  }

  toast.custom((id) =>
    React.createElement(
      "div",
      {
        className:
          "flex w-[calc(100vw-32px)] sm:w-[356px] rounded-xl overflow-hidden shadow-sm border border-solid items-center p-3.5",
        style: {
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor,
          fontFamily: "Inter, system-ui, sans-serif",
        },
      },
      // Message and Description Content (90% of total width)
      React.createElement(
        "div",
        {
          className: "flex-grow pr-3 flex flex-col justify-center text-left",
        },
        React.createElement(
          "div",
          { className: "text-xs sm:text-sm font-medium leading-normal" },
          message,
        ),
        description
          ? React.createElement(
              "div",
              {
                className:
                  "text-[10px] sm:text-xs mt-0.5 opacity-80 leading-normal",
              },
              description,
            )
          : null,
      ),
      // Close button (small, light, elegant, to the most right)
      React.createElement(
        "button",
        {
          onClick: () => toast.dismiss(id),
          className:
            "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-150 outline-none cursor-pointer border-0 bg-transparent text-xs",
          style: {
            color: textColor,
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = crossHoverColor;
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          },
          title: "Close",
        },
        "✕"
      ),
    ),
  );
};

/**
 * Custom styled toast wrapper for uniform alerts across the app
 */
export const showToast = {
  success: (message, description = "") => {
    if (!shouldShow(message)) return;
    renderCustomToast("success", message, description);
  },

  error: (message, description = "") => {
    if (!shouldShow(message)) return;
    renderCustomToast("error", message, description);
  },

  warning: (message, description = "") => {
    if (!shouldShow(message)) return;
    renderCustomToast("warning", message, description);
  },

  info: (message, description = "") => {
    if (!shouldShow(message)) return;
    renderCustomToast("info", message, description);
  },
};
