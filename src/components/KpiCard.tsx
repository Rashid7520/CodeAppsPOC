import React from 'react'
import { Stack, Text } from '@fluentui/react'

interface KpiCardProps {
  title: string
  value: string | number
  accentColor?: string
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, accentColor }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      padding: '1rem',
      minWidth: 160,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
    }}>
      <Stack tokens={{ childrenGap: 6 }}>
        <Text variant="small" styles={{ root: { color: '#666' } }}>{title}</Text>
        <Text style={{ fontSize: 28, fontWeight: 600, color: accentColor || '#002733' }}>{value}</Text>
      </Stack>
    </div>
  )
}

export default KpiCard
