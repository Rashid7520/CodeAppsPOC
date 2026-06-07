import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Persona, PersonaSize, Stack, PrimaryButton, DefaultButton, Text } from '@fluentui/react'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_assignments } from '../generated/models/Poce_assignmentsModel'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_assignmentspoce_status } from '../generated/models/Poce_assignmentsModel'
import { Poce_vehiclespoce_status } from '../generated/models/Poce_vehiclesModel'
import KpiCard from '../components/KpiCard'
import DashboardWidget from '../components/DashboardWidget'

type DashboardVehicle = {
  id: string
  VehicleNumber: string
  Model: string
  Status: string
}

type DashboardAssignment = {
  id: string
  ExecutiveName: string
  VehicleName: string
  Model: string
  StartDate: string
  ExpectedReturnDate: string
  Status: string
}

const statusLabel = (value: string | number | undefined, map: Record<string, string>) => {
  if (value === undefined || value === null) return 'Unknown'
  return map[String(value)] || String(value)
}

const VW_BLUE = '#002733'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<DashboardVehicle[]>([])
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    Promise.all([
      Poce_vehiclesService.getAll({
        select: ['poce_vehicleid', 'poce_vehiclename', 'poce_model', 'poce_status'],
        top: 5000,
      }),
      Poce_assignmentsService.getAll({
        select: ['poce_assignmentid', 'poce_executivename', 'poce_startdate', 'poce_expectedreturndate', 'poce_status', 'poce_vehiclename'],
        filter: 'poce_status eq 413450000',
        orderBy: ['poce_startdate desc'],
        top: 5,
      }),
    ])
      .then(([vehicleResult, assignmentResult]) => {
        if (!mounted) return

        const loadedVehicles = vehicleResult.data.map((item: Poce_vehiclesType) => ({
          id: item.poce_vehicleid,
          VehicleNumber: item.poce_vehiclename || 'Unknown',
          Model: item.poce_model,
          Status: statusLabel(item.poce_status, Poce_vehiclespoce_status),
        }))

        const vehicleModelMap = new Map<string, string>(loadedVehicles.map((vehicle) => [vehicle.VehicleNumber, vehicle.Model]))

        const loadedAssignments = assignmentResult.data.map((item: Poce_assignments) => ({
          id: item.poce_assignmentid,
          ExecutiveName: item.poce_executivename || 'Unknown',
          VehicleName: item.poce_vehiclename || 'Unknown',
          Model: vehicleModelMap.get(item.poce_vehiclename || '') || '—',
          StartDate: item.poce_startdate,
          ExpectedReturnDate: item.poce_expectedreturndate,
          Status: statusLabel(item.poce_status, Poce_assignmentspoce_status),
        }))

        setVehicles(loadedVehicles)
        setAssignments(loadedAssignments)
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

  const totalVehicles = vehicles.length
  const availableVehicles = vehicles.filter(v => v.Status === 'Available').length
  const assignedVehicles = vehicles.filter(v => v.Status === 'Assigned').length

  const activeAssignments = useMemo(() => assignments.filter(a => a.Status === 'Active').slice(0, 5), [assignments])
  const availableList = useMemo(() => vehicles.filter(v => v.Status === 'Available').slice(0, 5), [vehicles])

  return (
    <div style={{ padding: 20, background: '#f6f8fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Text variant="xxLarge" styles={{ root: { color: VW_BLUE, fontWeight: 600 } }}>Executive Mobility Tracker</Text>
          <div style={{ marginTop: 4 }}><Text styles={{ root: { color: '#666' } }}>Track executive vehicle assignments and availability</Text></div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <Text>Rashid Khan</Text>
            <Text styles={{ root: { color: '#666', fontSize: 12 } }}>Administrator</Text>
          </div>
          <Persona text="RK" size={PersonaSize.size40} />
        </div>
      </header>

      <Stack horizontal tokens={{ childrenGap: 12 }} styles={{ root: { marginBottom: 16 } }}>
        <KpiCard title="Total Vehicles" value={loading ? '—' : totalVehicles} accentColor={VW_BLUE} />
        <KpiCard title="Available Vehicles" value={loading ? '—' : availableVehicles} accentColor="#107C10" />
        <KpiCard title="Assigned Vehicles" value={loading ? '—' : assignedVehicles} accentColor="#D83B01" />
      </Stack>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <PrimaryButton text="Assign Vehicle" onClick={() => navigate('/assign')} />
        <DefaultButton text="View Assignments" onClick={() => navigate('/assignments')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 12 }}>
        <div>
          <DashboardWidget
            title="Current Vehicle Assignments"
            items={activeAssignments}
            loading={loading}
            error={error}
            emptyMessage="No active vehicle assignments found."
            viewAllLink="#/assignments"
            columns={[
              { key: 'ExecutiveName', name: 'Executive Name', render: (r: DashboardAssignment) => r.ExecutiveName },
              { key: 'VehicleName', name: 'Vehicle Number', render: (r: DashboardAssignment) => r.VehicleName },
              { key: 'Model', name: 'Vehicle Model', render: (r: DashboardAssignment) => r.Model },
              { key: 'StartDate', name: 'Start Date', render: (r: DashboardAssignment) => new Date(r.StartDate).toLocaleDateString() },
              { key: 'ExpectedReturnDate', name: 'Expected Return', render: (r: DashboardAssignment) => new Date(r.ExpectedReturnDate).toLocaleDateString() },
            ]}
          />
        </div>

        <div>
          <DashboardWidget
            title="Available Vehicles"
            items={availableList}
            loading={loading}
            error={error}
            emptyMessage="No vehicles are currently available."
            viewAllLink="#/vehicles"
            columns={[
              { key: 'VehicleNumber', name: 'Vehicle Number', render: (v: DashboardVehicle) => v.VehicleNumber },
              { key: 'Model', name: 'Model', render: (v: DashboardVehicle) => v.Model },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage
