import React from 'react';
import { colors, radius } from '../theme/tokens';

type ToneKey = 'success' | 'warning' | 'info' | 'neutral' | 'danger';

const TONES: Record<ToneKey, { bg: string; text: string }> = {
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning },
  info: { bg: colors.infoBg, text: colors.info },
  neutral: { bg: colors.neutralBadgeBg, text: colors.neutralBadgeText },
  danger: { bg: colors.dangerBg, text: colors.danger },
};

/** Maps known status strings to a visual tone. Unknown values fall back to neutral. */
function toneForStatus(status: string): ToneKey {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'success';
  if (normalized === 'assigned') return 'warning';
  if (normalized === 'active') return 'info';
  if (normalized === 'completed') return 'neutral';
  return 'neutral';
}

interface StatusBadgeProps {
  status: string;
  tone?: ToneKey;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, tone }) => {
  const resolved = TONES[tone ?? toneForStatus(status)];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: radius.pill,
        background: resolved.bg,
        color: resolved.text,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: resolved.text }} />
      {status}
    </span>
  );
};

export default StatusBadge;
