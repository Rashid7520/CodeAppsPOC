import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, Text, PrimaryButton, DefaultButton, Spinner, TextField, Dropdown, MessageBar, MessageBarType, Stack, Label } from '@fluentui/react'
import type { IDropdownOption } from '@fluentui/react'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import type { Poce_vehicles as Poce_vehiclesType } from '../generated/models/Poce_vehiclesModel'

const VW_BLUE = '#002733'

type VehicleOption = {
  id: string
  VehicleNumber: string
  Model: string
}

export const AssignVehiclePage: React.FC = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [executiveName, setExecutiveName] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined)
  const [startDate, setStartDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)

    Poce_vehiclesService.getAll({
      filter: 'poce_status eq 413450000',
      select: ['poce_vehicleid', 'poce_vehiclename', 'poce_model'],
      top: 5000,
    })
      .then((result) => {
        if (!mounted) return

        const availableVehicles = result.data.map((item: Poce_vehiclesType) => ({
          id: item.poce_vehicleid,
          VehicleNumber: item.poce_vehiclename || 'Unknown',
          Model: item.poce_model,
        }))

        setVehicles(availableVehicles)
      })
      .catch((e) => {
        console.error(e)
        if (!mounted) return
        setError((e as Error).message)
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  const vehicleOptions: IDropdownOption[] = vehicles.map(v => ({
    key: v.id,
    text: `${v.VehicleNumber} - ${v.Model}`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!executiveName.trim()) {
      setError('Executive name is required')
      return
    }
    if (!selectedVehicleId) {
      setError('Please select a vehicle')
      return
    }
    if (!startDate) {
      setError('Start date is required')
      return
    }
    if (!expectedReturnDate) {
      setError('Expected return date is required')
      return
    }

    setSaving(true)

    try {
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)

      const assignmentData = {
        poce_executivename: executiveName.trim(),
        'poce_Vehicle@odata.bind': `/poce_vehicles(${selectedVehicleId})`,
        poce_startdate: startDate,
        poce_expectedreturndate: expectedReturnDate,
        poce_status: 413450000,
        poce_purpose: purpose.trim() || undefined,
        ownerid: 'system',
        owneridtype: 'systemuser',
        statecode: 0,
      }

      await Poce_assignmentsService.create(assignmentData as any)

      await Poce_vehiclesService.update(selectedVehicleId, {
        poce_status: 413450001,
      } as any)

      setSuccess(`Vehicle ${selectedVehicle?.VehicleNumber} successfully assigned to ${executiveName}`)

      setExecutiveName('')
      setSelectedVehicleId(undefined)
      setStartDate('')
      setExpectedReturnDate('')
      setPurpose('')

      setVehicles(prev => prev.filter(v => v.id !== selectedVehicleId))

      setTimeout(() => {
        navigate('/assignments')
      }, 1500)
    } catch (e) {
      console.error(e)
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 20, background: '#f6f8fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Link href="#/" style={{ textDecoration: 'none' }}>
            <Text variant="xxLarge" styles={{ root: { color: VW_BLUE, fontWeight: 600 } }}>Executive Mobility Tracker</Text>
          </Link>
          <div style={{ marginTop: 4 }}><Text styles={{ root: { color: '#666' } }}>Assign a vehicle to an executive</Text></div>
        </div>
      </header>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 600 }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner label="Loading available vehicles..." /></div>
        ) : (
          <>
            {error && <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginBottom: 16 } }}>{error}</MessageBar>}
            {success && <MessageBar messageBarType={MessageBarType.success} styles={{ root: { marginBottom: 16 } }}>{success}</MessageBar>}

            {vehicles.length === 0 && !loading ? (
              <div style={{ padding: 12 }}>
                <Text styles={{ root: { color: '#666' } }}>No vehicles are currently available for assignment.</Text>
                <div style={{ marginTop: 12 }}>
                  <DefaultButton text="Back to Home" onClick={() => navigate('/')} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack tokens={{ childrenGap: 16 }}>
                  <TextField
                    label="Executive Name"
                    required
                    value={executiveName}
                    onChange={(_, v) => setExecutiveName(v || '')}
                    placeholder="Enter executive name"
                    disabled={saving}
                  />

                  <div>
                    <Label required>Select Vehicle</Label>
                    <Dropdown
                      placeholder="Select a vehicle"
                      options={vehicleOptions}
                      selectedKey={selectedVehicleId}
                      onChange={(_, option) => setSelectedVehicleId(option?.key as string)}
                      disabled={saving}
                    />
                  </div>

                  <TextField
                    label="Start Date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(_, v) => setStartDate(v || '')}
                    disabled={saving}
                  />

                  <TextField
                    label="Expected Return Date"
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(_, v) => setExpectedReturnDate(v || '')}
                    disabled={saving}
                  />

                  <TextField
                    label="Purpose"
                    multiline
                    rows={3}
                    value={purpose}
                    onChange={(_, v) => setPurpose(v || '')}
                    placeholder="Purpose of assignment (optional)"
                    disabled={saving}
                  />

                  <Stack horizontal tokens={{ childrenGap: 8 }}>
                    <PrimaryButton type="submit" text={saving ? 'Assigning...' : 'Assign Vehicle'} disabled={saving} />
                    <DefaultButton text="Cancel" onClick={() => navigate('/')} disabled={saving} />
                  </Stack>
                </Stack>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AssignVehiclePage
