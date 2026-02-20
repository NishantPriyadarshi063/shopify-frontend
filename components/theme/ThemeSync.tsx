"use client";

import { useEffect } from "react";

/**
 * After mount, sync data-theme from localStorage so the UI matches the stored preference.
 * The initial paint is handled by ThemeScript in the layout.
 */
export function ThemeSync() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "dark" || theme === "light") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch {
      // ignore
    }
  }, []);
  return null;
}
