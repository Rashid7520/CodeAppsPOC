import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, DefaultButton, Spinner, SpinnerSize, DetailsList, DetailsListLayoutMode, SelectionMode, MessageBar, MessageBarType } from '@fluentui/react'
import type { IColumn } from '@fluentui/react'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_assignments } from '../generated/models/Poce_assignmentsModel'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_assignmentspoce_status } from '../generated/models/Poce_assignmentsModel'
import { usePageHeader } from '../layout/usePageHeader'
import { colors, radius, shadow, spacing } from '../theme/tokens'
import StatusBadge from '../components/StatusBadge'

type AssignmentRecord = {
  id: string
  ExecutiveName: string
  VehicleNumber: string
  Model: string
  StartDate: string
  ExpectedReturnDate: string
  Status: string
}

const statusLabel = (value: string | number | undefined, map: Record<string, string>) => {
  if (value === undefined || value === null) return 'Unknown'
  return map[String(value)] || String(value)
}

type FilterKey = 'all' | 'active' | 'completed'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Assignments' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate()
  usePageHeader('Assignments', 'All executive vehicle assignments, active and completed')

  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    let mounted = true

    Promise.all([
      Poce_vehiclesService.getAll({
        select: ['poce_vehicleid', 'poce_vehiclename', 'poce_model'],
        top: 5000,
      }),
      Poce_assignmentsService.getAll({
        select: ['poce_assignmentid', 'poce_executivename', 'poce_startdate', 'poce_expectedreturndate', 'poce_status', 'poce_vehiclename'],
        orderBy: ['poce_startdate desc'],
        top: 500,
      }),
    ])
      .then(([vehicleResult, assignmentResult]) => {
        if (!mounted) return

        const vehicleModelMap = new Map<string, string>(
          vehicleResult.data.map((v: Poce_vehiclesType) => [v.poce_vehiclename || '', v.poce_model])
        )

        const loadedAssignments = assignmentResult.data.map((item: Poce_assignments) => ({
          id: item.poce_assignmentid,
          ExecutiveName: item.poce_executivename || 'Unknown',
          VehicleNumber: item.poce_vehiclename || 'Unknown',
          Model: vehicleModelMap.get(item.poce_vehiclename || '') || '—',
          StartDate: item.poce_startdate,
          ExpectedReturnDate: item.poce_expectedreturndate,
          Status: statusLabel(item.poce_status, Poce_assignmentspoce_status),
        }))

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

  const filteredAssignments = useMemo(() => {
    if (filter === 'all') return assignments
    return assignments.filter((a) => a.Status.toLowerCase() === filter)
  }, [assignments, filter])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const columns: IColumn[] = [
    { key: 'ExecutiveName', name: 'Executive Name', fieldName: 'ExecutiveName', minWidth: 150, isResizable: true },
    { key: 'VehicleNumber', name: 'Vehicle Number', fieldName: 'VehicleNumber', minWidth: 120, isResizable: true },
    { key: 'Model', name: 'Vehicle Model', fieldName: 'Model', minWidth: 110, isResizable: true },
    { key: 'StartDate', name: 'Start Date', minWidth: 110, isResizable: true, onRender: (item: AssignmentRecord) => formatDate(item.StartDate) },
    { key: 'ExpectedReturnDate', name: 'Expected Return', minWidth: 120, isResizable: true, onRender: (item: AssignmentRecord) => formatDate(item.ExpectedReturnDate) },
    { key: 'Status', name: 'Status', minWidth: 110, isResizable: true, onRender: (item: AssignmentRecord) => <StatusBadge status={item.Status} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          {FILTERS.map((f) =>
            filter === f.key ? (
              <PrimaryButton key={f.key} text={f.label} onClick={() => setFilter(f.key)} />
            ) : (
              <DefaultButton key={f.key} text={f.label} onClick={() => setFilter(f.key)} />
            )
          )}
        </div>
        <DefaultButton text="Assign Vehicle" iconProps={{ iconName: 'Assign' }} onClick={() => navigate('/assign')} />
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
            <Spinner size={SpinnerSize.medium} label="Loading assignments…" />
          </div>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        ) : filteredAssignments.length === 0 ? (
          <div style={{ padding: 12, color: colors.textSecondary }}>No assignments found.</div>
        ) : (
          <DetailsList
            items={filteredAssignments}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
      </div>
    </div>
  )
}

export default AssignmentsPage
