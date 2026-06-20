import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Text } from '@fluentui/react'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_assignments } from '../generated/models/Poce_assignmentsModel'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_assignmentspoce_status } from '../generated/models/Poce_assignmentsModel'
import { Poce_vehiclespoce_status } from '../generated/models/Poce_vehiclesModel'
import KpiCard from '../components/KpiCard'
import DashboardWidget from '../components/DashboardWidget'
import StatusBadge from '../components/StatusBadge'
import { usePageHeader } from '../layout/usePageHeader'
import { colors } from '../theme/tokens'
import '../styles/dashboard.css'

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

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  usePageHeader('Executive Mobility Tracker', 'Track executive vehicle assignments and availability')

  const [vehicles, setVehicles] = useState<DashboardVehicle[]>([])
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

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

    return () => {
      mounted = false
    }
  }, [])

  const totalVehicles = vehicles.length
  const availableVehicles = vehicles.filter((v) => v.Status === 'Available').length
  const assignedVehicles = vehicles.filter((v) => v.Status === 'Assigned').length

  const activeAssignments = useMemo(() => assignments.filter((a) => a.Status === 'Active').slice(0, 5), [assignments])
  const availableList = useMemo(() => vehicles.filter((v) => v.Status === 'Available').slice(0, 5), [vehicles])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPI cards */}
      <section>
        <p className="section-title">Fleet Overview</p>
        <div className="kpi-grid">
          <KpiCard title="Total Vehicles" value={totalVehicles} icon="Car" accentColor={colors.brand} loading={loading} />
          <KpiCard title="Available Vehicles" value={availableVehicles} icon="CompletedSolid" accentColor={colors.success} loading={loading} />
          <KpiCard title="Assigned Vehicles" value={assignedVehicles} icon="ContactCard" accentColor={colors.warning} loading={loading} />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions">
          <button type="button" className="quick-action-card" onClick={() => navigate('/assign')}>
            <span className="quick-action-icon">
              <Icon iconName="Assign" />
            </span>
            <span>
              <span className="quick-action-label" style={{ display: 'block' }}>Assign Vehicle</span>
              <span className="quick-action-sub">Create a new executive assignment</span>
            </span>
          </button>

          <button type="button" className="quick-action-card" onClick={() => navigate('/assignments')}>
            <span className="quick-action-icon">
              <Icon iconName="ClipboardList" />
            </span>
            <span>
              <span className="quick-action-label" style={{ display: 'block' }}>View Assignments</span>
              <span className="quick-action-sub">Browse all active and past assignments</span>
            </span>
          </button>
        </div>
      </section>

      {/* Widgets */}
      <section className="widgets-grid">
        <DashboardWidget<DashboardAssignment>
          title="Current Vehicle Assignments"
          items={activeAssignments}
          loading={loading}
          error={error}
          emptyMessage="No active vehicle assignments found."
          viewAllLink="/assignments"
          getKey={(item) => item.id}
          columns={[
            { key: 'ExecutiveName', name: 'Executive Name', minWidth: 140 },
            { key: 'VehicleName', name: 'Vehicle Number', minWidth: 120 },
            { key: 'Model', name: 'Vehicle Model', minWidth: 120 },
            { key: 'StartDate', name: 'Start Date', minWidth: 110, render: (r) => formatDate(r.StartDate) },
            { key: 'ExpectedReturnDate', name: 'Expected Return Date', minWidth: 140, render: (r) => formatDate(r.ExpectedReturnDate) },
            { key: 'Status', name: 'Status', minWidth: 100, render: (r) => <StatusBadge status={r.Status} /> },
          ]}
        />

        <DashboardWidget<DashboardVehicle>
          title="Available Vehicles"
          items={availableList}
          loading={loading}
          error={error}
          emptyMessage="No vehicles are currently available."
          viewAllLink="/vehicles"
          getKey={(item) => item.id}
          columns={[
            { key: 'VehicleNumber', name: 'Vehicle Number', minWidth: 130 },
            { key: 'Model', name: 'Model', minWidth: 130 },
          ]}
        />
      </section>

      {error && !loading && (
        <Text styles={{ root: { color: colors.danger, fontSize: 13 } }}>{error}</Text>
      )}
    </div>
  )
}

export default HomePage
