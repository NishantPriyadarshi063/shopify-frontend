/**
 * Inline script that runs before React so the correct theme is applied immediately
 * and there’s no flash of the wrong theme. Reads "theme" from localStorage and
 * sets data-theme on <html>.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (theme === 'dark' || theme === 'light') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
