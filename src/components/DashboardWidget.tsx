import React from 'react'
import { Spinner, Link, Text } from '@fluentui/react'

interface Column<T> { key: string; name: string; render?: (item: T) => React.ReactNode }

interface DashboardWidgetProps<T> {
  title: string
  columns: Column<T>[]
  items: T[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  viewAllLink?: string
}

export function DashboardWidget<T>({ title, columns, items, loading, error, emptyMessage, viewAllLink }: DashboardWidgetProps<T>) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', minHeight: 160 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text variant="large">{title}</Text>
        {viewAllLink && <Link href={viewAllLink}>View all</Link>}
      </div>

      {loading ? (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner label="Loading" /></div>
      ) : error ? (
        <div style={{ padding: 12 }}><Text styles={{ root: { color: 'red' } }}>{error}</Text></div>
      ) : items.length === 0 ? (
        <div style={{ padding: 12 }}><Text styles={{ root: { color: '#666' } }}>{emptyMessage || 'No data.'}</Text></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.key} style={{ textAlign: 'left', padding: '8px 6px', color: '#666', fontSize: 13 }}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={(item as any).id || (item as any).AssignmentId || (item as any).VehicleId || idx} style={{ borderTop: '1px solid #f1f1f1' }}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: '10px 6px' }}>{c.render ? c.render(item) : (item as any)[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DashboardWidget
