import type { Vehicle, Assignment } from '../types'

const DATAVERSE_BASE = import.meta.env.VITE_DATAVERSE_BASE || ''

async function getAuthToken(): Promise<string> {
  // Placeholder: replace with real auth flow (MSAL, etc.)
  return ''
}

async function request<T>(path: string): Promise<T> {
  const token = await getAuthToken()
  const url = DATAVERSE_BASE ? `${DATAVERSE_BASE}${path}` : path
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Dataverse request failed: ${res.status} ${res.statusText} - ${text}`)
  }
  return (await res.json()) as T
}

export async function getVehicles(): Promise<Vehicle[]> {
  // OData query - fetch basic fields
  const path = `/api/data/v9.1/vehicles?$select=vehicleid,vehiclenumber,model,status`
  const payload: any = await request<any>(path)
  // map to Vehicle[] - Dataverse returns value array
  const items = payload.value || []
  return items.map((i: any) => ({
    VehicleId: i.vehicleid || i.VehicleId,
    VehicleNumber: i.vehiclenumber || i.VehicleNumber,
    Model: i.model || i.Model,
    Status: i.status || i.Status,
  }))
}

export async function getAssignments(): Promise<Assignment[]> {
  // Expand Vehicle lookup
  const path = `/api/data/v9.1/assignments?$select=assignmentid,executivename,startdate,expectedreturndate,status&$expand=vehicle($select=vehicleid,vehiclenumber,model)`
  const payload: any = await request<any>(path)
  const items = payload.value || []
  return items.map((i: any) => ({
    AssignmentId: i.assignmentid || i.AssignmentId,
    ExecutiveName: i.executivename || i.ExecutiveName,
    Vehicle: i.vehicle
      ? {
          VehicleId: i.vehicle.vehicleid,
          VehicleNumber: i.vehicle.vehiclenumber,
          Model: i.vehicle.model,
        }
      : { VehicleId: i._vehicle_value },
    StartDate: i.startdate || i.StartDate,
    ExpectedReturnDate: i.expectedreturndate || i.ExpectedReturnDate,
    Status: i.status || i.Status,
  }))
}

export default { getVehicles, getAssignments }
