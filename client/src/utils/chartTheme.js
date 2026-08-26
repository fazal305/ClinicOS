// Reads the live CSS custom properties so charts always match the current
// design tokens and theme (light/dark), instead of hard-coding hex values.
export function useChartTheme() {
  if (typeof document === 'undefined') {
    return { primary: '#1d6fb8', secondary: '#4b5d70', success: '#1f8a5f', warning: '#b8790d', muted: '#667384', border: '#e0e4e9', text: '#1a2530' };
  }
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name)?.trim() || fallback;
  return {
    primary: read('--color-primary', '#1d6fb8'),
    secondary: read('--color-secondary', '#4b5d70'),
    success: read('--color-success', '#1f8a5f'),
    warning: read('--color-warning', '#b8790d'),
    muted: read('--color-muted', '#667384'),
    border: read('--color-border', '#e0e4e9'),
    text: read('--color-text', '#1a2530'),
  };
}

export const CHART_SERIES_COLORS = ['primary', 'success', 'warning', 'secondary'];
