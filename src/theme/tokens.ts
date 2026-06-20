/**
 * Shared design tokens for Executive Mobility Tracker.
 * Keeping these centralized avoids re-typing magic numbers/colors in every
 * component and makes the look-and-feel easy to adjust in one place.
 */
import { VW_BLUE } from './theme';

export const colors = {
  brand: VW_BLUE,
  brandSurface: '#0F3F4D',
  pageBackground: '#F3F6F8',
  surface: '#FFFFFF',
  border: '#E1E6E9',
  textPrimary: '#1B2A2F',
  textSecondary: '#5B6B70',
  textOnBrand: '#FFFFFF',

  success: '#107C10',
  successBg: '#DFF6DD',
  warning: '#CA5010',
  warningBg: '#FDE7DA',
  info: '#0F6CBD',
  infoBg: '#DEECF9',
  neutralBadgeBg: '#EDEBE9',
  neutralBadgeText: '#605E5C',
  danger: '#A4262C',
  dangerBg: '#FDE7E9',
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const shadow = {
  sm: '0 1px 2px rgba(0, 39, 51, 0.06)',
  md: '0 2px 8px rgba(0, 39, 51, 0.08)',
  lg: '0 8px 24px rgba(0, 39, 51, 0.12)',
} as const;
