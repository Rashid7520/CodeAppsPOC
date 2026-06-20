import React from 'react';
import { Icon, Text } from '@fluentui/react';
import { colors, radius, shadow, spacing } from '../theme/tokens';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  accentColor?: string;
  loading?: boolean;
}

/**
 * Reusable KPI summary card. Drop into any dashboard grid — accentColor
 * lets each metric have its own visual identity (e.g. green for "available").
 */
export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, accentColor, loading }) => {
  const accent = accentColor || colors.brand;

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        boxShadow: shadow.md,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.lg,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          background: `${accent}1A`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon iconName={icon} styles={{ root: { fontSize: 22 } }} />
      </div>

      <div style={{ minWidth: 0 }}>
        <Text
          variant="small"
          styles={{ root: { color: colors.textSecondary, fontWeight: 600, letterSpacing: '0.2px', display: 'block' } }}
        >
          {title.toUpperCase()}
        </Text>
        <Text
          styles={{
            root: {
              fontSize: 30,
              fontWeight: 700,
              color: colors.textPrimary,
              lineHeight: 1.2,
              display: 'block',
              marginTop: 2,
            },
          }}
        >
          {loading ? '—' : value}
        </Text>
      </div>
    </div>
  );
};

export default KpiCard;
