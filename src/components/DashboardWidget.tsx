import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { DetailsList, DetailsListLayoutMode, type IColumn, MessageBar, MessageBarType, SelectionMode, Spinner, SpinnerSize, Text } from '@fluentui/react';
import { colors, radius, shadow, spacing } from '../theme/tokens';

export interface WidgetColumn<T> {
  key: string;
  name: string;
  minWidth?: number;
  render?: (item: T) => React.ReactNode;
}

interface DashboardWidgetProps<T> {
  title: string;
  columns: WidgetColumn<T>[];
  items: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  viewAllLink?: string;
  getKey?: (item: T, index: number) => string;
}

export function DashboardWidget<T extends Record<string, unknown>>({
  title,
  columns,
  items,
  loading,
  error,
  emptyMessage,
  viewAllLink,
  getKey,
}: DashboardWidgetProps<T>) {
  const fluentColumns: IColumn[] = columns.map((c) => ({
    key: c.key,
    name: c.name,
    fieldName: c.key,
    minWidth: c.minWidth ?? 110,
    isResizable: true,
    onRender: c.render ? (item: T) => c.render!(item) : undefined,
  }));

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        boxShadow: shadow.sm,
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${spacing.lg}px ${spacing.xl}px`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Text variant="large" styles={{ root: { fontWeight: 600, color: colors.textPrimary } }}>
          {title}
        </Text>
        {viewAllLink && (
          <RouterLink to={viewAllLink} style={{ fontSize: 13, fontWeight: 600, color: colors.brand, textDecoration: 'none' }}>
            View all &rsaquo;
          </RouterLink>
        )}
      </div>

      <div style={{ flex: 1, padding: items.length === 0 || loading || error ? spacing.xl : 0 }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Spinner size={SpinnerSize.medium} label="Loading…" />
          </div>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        ) : items.length === 0 ? (
          <Text styles={{ root: { color: colors.textSecondary } }}>{emptyMessage || 'No data.'}</Text>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <DetailsList
              items={items}
              columns={fluentColumns}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
              getKey={getKey ? (item, index) => getKey(item, index ?? 0) : undefined}
              styles={{
                headerWrapper: { '& .ms-DetailsHeader': { paddingTop: 0 } },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardWidget;
