import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, PrimaryButton, DefaultButton, Spinner, DetailsList, DetailsListLayoutMode, SelectionMode, MessageBar, MessageBarType, Link, Stack } from '@fluentui/react'
import type { IColumn } from '@fluentui/react'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import type { Poce_assignments } from '../generated/models/Poce_assignmentsModel'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'
import { Poce_assignmentspoce_status } from '../generated/models/Poce_assignmentsModel'

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

const VW_BLUE = '#002733'

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    let mounted = true
    setLoading(true)

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

    return () => { mounted = false }
  }, [])

  const filteredAssignments = useMemo(() => {
    if (filter === 'all') return assignments
    return assignments.filter(a => a.Status.toLowerCase() === filter)
  }, [assignments, filter])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  const columns: IColumn[] = [
    { key: 'ExecutiveName', name: 'Executive Name', fieldName: 'ExecutiveName', minWidth: 150, isResizable: true },
    { key: 'VehicleNumber', name: 'Vehicle Number', fieldName: 'VehicleNumber', minWidth: 120, isResizable: true },
    { key: 'Model', name: 'Vehicle Model', fieldName: 'Model', minWidth: 100, isResizable: true },
    { key: 'StartDate', name: 'Start Date', minWidth: 100, isResizable: true, onRender: (item: AssignmentRecord) => formatDate(item.StartDate) },
    { key: 'ExpectedReturnDate', name: 'Expected Return', minWidth: 110, isResizable: true, onRender: (item: AssignmentRecord) => formatDate(item.ExpectedReturnDate) },
    { key: 'Status', name: 'Status', fieldName: 'Status', minWidth: 100, isResizable: true },
  ]

  return (
    <div style={{ padding: 20, background: '#f6f8fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Link href="#/" style={{ textDecoration: 'none' }}>
            <Text variant="xxLarge" styles={{ root: { color: VW_BLUE, fontWeight: 600 } }}>Executive Mobility Tracker</Text>
          </Link>
          <div style={{ marginTop: 4 }}><Text styles={{ root: { color: '#666' } }}>All vehicle assignments</Text></div>
        </div>
      </header>

      <Stack horizontal tokens={{ childrenGap: 8 }} styles={{ root: { marginBottom: 16 } }}>
        <PrimaryButton text="Assign Vehicle" onClick={() => navigate('/assign')} />
        <DefaultButton text={filter === 'all' ? 'All Assignments' : `All Assignments`} onClick={() => setFilter('all')} />
        <DefaultButton text={filter === 'active' ? 'Active' : 'Active'} onClick={() => setFilter('active')} />
        <DefaultButton text={filter === 'completed' ? 'Completed' : 'Completed'} onClick={() => setFilter('completed')} />
      </Stack>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner label="Loading assignments..." /></div>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        ) : filteredAssignments.length === 0 ? (
          <div style={{ padding: 12 }}><Text styles={{ root: { color: '#666' } }}>No assignments found.</Text></div>
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
