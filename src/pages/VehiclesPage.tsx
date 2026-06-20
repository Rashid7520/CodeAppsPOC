import React, { useEffect, useState, useMemo } from 'react'
import { DefaultButton, PrimaryButton, Spinner, SpinnerSize, DetailsList, DetailsListLayoutMode, SelectionMode, MessageBar, MessageBarType } from '@fluentui/react'
import type { IColumn } from '@fluentui/react'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_vehiclespoce_status } from '../generated/models/Poce_vehiclesModel'
import { usePageHeader } from '../layout/usePageHeader'
import { colors, radius, shadow, spacing } from '../theme/tokens'
import KpiCard from '../components/KpiCard'
import StatusBadge from '../components/StatusBadge'
import '../styles/dashboard.css'

type VehicleRecord = {
  id: string
  VehicleNumber: string
  Model: string
  Status: string
}

const statusLabel = (value: string | number | undefined, map: Record<string, string>) => {
  if (value === undefined || value === null) return 'Unknown'
  return map[String(value)] || String(value)
}

type FilterKey = 'all' | 'available' | 'assigned'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Vehicles' },
  { key: 'available', label: 'Available' },
  { key: 'assigned', label: 'Assigned' },
]

export const VehiclesPage: React.FC = () => {
  usePageHeader('Vehicle Fleet', 'Manage and track every vehicle in the fleet')

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    let mounted = true

    Poce_vehiclesService.getAll({
      select: ['poce_vehicleid', 'poce_vehiclename', 'poce_model', 'poce_status'],
      top: 5000,
    })
      .then((result) => {
        if (!mounted) return

        const loadedVehicles = result.data.map((item: Poce_vehiclesType) => ({
          id: item.poce_vehicleid,
          VehicleNumber: item.poce_vehiclename || 'Unknown',
          Model: item.poce_model,
          Status: statusLabel(item.poce_status, Poce_vehiclespoce_status),
        }))

        setVehicles(loadedVehicles)
        setError(null)
      })
      .catch((e) => {
        console.error(e)
        if (!mounted) return
        setError((e as Error).message)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const filteredVehicles = useMemo(() => {
    if (filter === 'all') return vehicles
    return vehicles.filter((v) => v.Status.toLowerCase() === filter)
  }, [vehicles, filter])

  const columns: IColumn[] = [
    { key: 'VehicleNumber', name: 'Vehicle Number', fieldName: 'VehicleNumber', minWidth: 150, isResizable: true },
    { key: 'Model', name: 'Model', fieldName: 'Model', minWidth: 150, isResizable: true },
    {
      key: 'Status',
      name: 'Status',
      fieldName: 'Status',
      minWidth: 120,
      isResizable: true,
      onRender: (item: VehicleRecord) => <StatusBadge status={item.Status} />,
    },
  ]

  const totalVehicles = vehicles.length
  const availableCount = vehicles.filter((v) => v.Status === 'Available').length
  const assignedCount = vehicles.filter((v) => v.Status === 'Assigned').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      <div className="kpi-grid">
        <KpiCard title="Total" value={totalVehicles} icon="Car" accentColor={colors.brand} loading={loading} />
        <KpiCard title="Available" value={availableCount} icon="CompletedSolid" accentColor={colors.success} loading={loading} />
        <KpiCard title="Assigned" value={assignedCount} icon="ContactCard" accentColor={colors.warning} loading={loading} />
      </div>

      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        {FILTERS.map((f) =>
          filter === f.key ? (
            <PrimaryButton key={f.key} text={f.label} onClick={() => setFilter(f.key)} />
          ) : (
            <DefaultButton key={f.key} text={f.label} onClick={() => setFilter(f.key)} />
          )
        )}
      </div>

      <div
        style={{
          background: colors.surface,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadow.sm,
          padding: spacing.lg,
        }}
      >
        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Spinner size={SpinnerSize.medium} label="Loading vehicles…" />
          </div>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        ) : filteredVehicles.length === 0 ? (
          <div style={{ padding: 12, color: colors.textSecondary }}>No vehicles found.</div>
        ) : (
          <DetailsList
            items={filteredVehicles}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
      </div>
    </div>
  )
}

export default VehiclesPage
