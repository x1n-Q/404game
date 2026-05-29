import type { Theme, ThemeName } from '../types';

export const themes: Record<ThemeName, Theme> = {
  neon: {
    bg: '#0a0a18',
    fg: '#f0f0ff',
    accent: '#00ffd5',
    danger: '#ff3b6b',
    muted: '#5a5a8a',
    font: '"Courier New", monospace',
  },
  retro: {
    bg: '#2b1d0e',
    fg: '#ffe1a8',
    accent: '#ffaa00',
    danger: '#d62828',
    muted: '#8a6b3b',
    font: '"Courier New", monospace',
  },
  minimal: {
    bg: '#fafafa',
    fg: '#111111',
    accent: '#0066ff',
    danger: '#e63946',
    muted: '#999999',
    font: 'system-ui, -apple-system, sans-serif',
  },
  dark: {
    bg: '#1a1a1a',
    fg: '#e8e8e8',
    accent: '#7c5cff',
    danger: '#ff5252',
    muted: '#666666',
    font: 'system-ui, -apple-system, sans-serif',
  },
};

export function getTheme(name: ThemeName | undefined): Theme {
  return themes[name ?? 'neon'] ?? themes.neon;
}
