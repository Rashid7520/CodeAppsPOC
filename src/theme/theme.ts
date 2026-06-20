/**
 * Application theme for Executive Mobility Tracker.
 * Builds a Fluent UI v8 theme from the Volkswagen blue brand color (#002733)
 * and applies it globally with loadTheme(). Import this module once, as early
 * as possible (see src/main.tsx), before any Fluent UI component renders.
 */
import { createTheme, loadTheme } from '@fluentui/react/lib/Styling';
import type { ITheme } from '@fluentui/react/lib/Styling';

export const VW_BLUE = '#002733';

// --- tiny color helpers (no extra dependencies) ---------------------------

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v: number) => {
    const n = Math.round((v + m) * 255);
    return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Shift a hex color's lightness by `delta` percentage points (clamped 0-100). */
function shade(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, Math.min(100, l + delta)));
}

// --- VW-blue derived ramp ---------------------------------------------------

const themePrimary = VW_BLUE;
const themeDarker = shade(VW_BLUE, -5);
const themeDark = shade(VW_BLUE, -3);
const themeDarkAlt = shade(VW_BLUE, -1.5);
const themeSecondary = shade(VW_BLUE, 10);
const themeTertiary = shade(VW_BLUE, 24);
const themeLight = shade(VW_BLUE, 58);
const themeLighter = shade(VW_BLUE, 72);
const themeLighterAlt = shade(VW_BLUE, 88);

export const appTheme: ITheme = createTheme({
  palette: {
    themePrimary,
    themeLighterAlt,
    themeLighter,
    themeLight,
    themeTertiary,
    themeSecondary,
    themeDarkAlt,
    themeDark,
    themeDarker,

    black: '#000000',
    neutralDark: '#201f1e',
    neutralPrimary: '#323130',
    neutralPrimaryAlt: '#3b3a39',
    neutralSecondary: '#605e5c',
    neutralSecondaryAlt: '#8a8886',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d0d0d0',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralLight: '#edebe9',
    neutralLighter: '#f3f2f1',
    neutralLighterAlt: '#faf9f8',
    white: '#ffffff',
  },
  defaultFontStyle: {
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
});

loadTheme(appTheme);
