import React, { useEffect, useState, useMemo } from 'react'
import { Link, Text, DefaultButton, Spinner, DetailsList, DetailsListLayoutMode, SelectionMode, MessageBar, MessageBarType, Stack } from '@fluentui/react'
import type { IColumn } from '@fluentui/react'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_vehiclespoce_status } from '../generated/models/Poce_vehiclesModel'

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

const VW_BLUE = '#002733'

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all')

  useEffect(() => {
    let mounted = true
    setLoading(true)

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

    return () => { mounted = false }
  }, [])

  const filteredVehicles = useMemo(() => {
    if (filter === 'all') return vehicles
    return vehicles.filter(v => v.Status.toLowerCase() === filter)
  }, [vehicles, filter])

  const columns: IColumn[] = [
    { key: 'VehicleNumber', name: 'Vehicle Number', fieldName: 'VehicleNumber', minWidth: 150, isResizable: true },
    { key: 'Model', name: 'Model', fieldName: 'Model', minWidth: 150, isResizable: true },
    { key: 'Status', name: 'Status', fieldName: 'Status', minWidth: 100, isResizable: true },
  ]

  const totalVehicles = vehicles.length
  const availableCount = vehicles.filter(v => v.Status === 'Available').length
  const assignedCount = vehicles.filter(v => v.Status === 'Assigned').length

  return (
    <div style={{ padding: 20, background: '#f6f8fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Link href="#/" style={{ textDecoration: 'none' }}>
            <Text variant="xxLarge" styles={{ root: { color: VW_BLUE, fontWeight: 600 } }}>Executive Mobility Tracker</Text>
          </Link>
          <div style={{ marginTop: 4 }}><Text styles={{ root: { color: '#666' } }}>Vehicle fleet management</Text></div>
        </div>
      </header>

      <Stack horizontal tokens={{ childrenGap: 12 }} styles={{ root: { marginBottom: 16 } }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', minWidth: 120, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Text variant="small" styles={{ root: { color: '#666' } }}>Total</Text>
          <div><Text style={{ fontSize: 24, fontWeight: 600, color: VW_BLUE }}>{totalVehicles}</Text></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', minWidth: 120, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Text variant="small" styles={{ root: { color: '#666' } }}>Available</Text>
          <div><Text style={{ fontSize: 24, fontWeight: 600, color: '#107C10' }}>{availableCount}</Text></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', minWidth: 120, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Text variant="small" styles={{ root: { color: '#666' } }}>Assigned</Text>
          <div><Text style={{ fontSize: 24, fontWeight: 600, color: '#D83B01' }}>{assignedCount}</Text></div>
        </div>
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 8 }} styles={{ root: { marginBottom: 16 } }}>
        <DefaultButton text={filter === 'all' ? 'All Vehicles' : 'All Vehicles'} onClick={() => setFilter('all')} />
        <DefaultButton text={filter === 'available' ? 'Available' : 'Available'} onClick={() => setFilter('available')} />
        <DefaultButton text={filter === 'assigned' ? 'Assigned' : 'Assigned'} onClick={() => setFilter('assigned')} />
      </Stack>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner label="Loading vehicles..." /></div>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        ) : filteredVehicles.length === 0 ? (
          <div style={{ padding: 12 }}><Text styles={{ root: { color: '#666' } }}>No vehicles found.</Text></div>
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
