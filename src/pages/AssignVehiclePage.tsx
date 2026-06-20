import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, DefaultButton, Spinner, SpinnerSize, TextField, Dropdown, MessageBar, MessageBarType, Stack, Label } from '@fluentui/react'
import type { IDropdownOption } from '@fluentui/react'
import { Poce_vehiclesService } from '../generated/services/Poce_vehiclesService'
import { Poce_assignmentsService } from '../generated/services/Poce_assignmentsService'
import type { Poce_vehicles as Poce_vehiclesType, Poce_vehiclesBase } from '../generated/models/Poce_vehiclesModel'
import type { Poce_assignmentsBase } from '../generated/models/Poce_assignmentsModel'
import { usePageHeader } from '../layout/usePageHeader'
import { colors, radius, shadow, spacing } from '../theme/tokens'

type VehicleOption = {
  id: string
  VehicleNumber: string
  Model: string
}

export const AssignVehiclePage: React.FC = () => {
  const navigate = useNavigate()
  usePageHeader('Assign Vehicle', 'Create a new executive vehicle assignment')

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

    return () => {
      mounted = false
    }
  }, [])

  const vehicleOptions: IDropdownOption[] = vehicles.map((v) => ({
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
      const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)

      const assignmentData: Omit<Poce_assignmentsBase, 'poce_assignmentid'> = {
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

      await Poce_assignmentsService.create(assignmentData)

      const vehicleUpdate: Partial<Omit<Poce_vehiclesBase, 'poce_vehicleid'>> = {
        poce_status: 413450001,
      }

      await Poce_vehiclesService.update(selectedVehicleId, vehicleUpdate)

      setSuccess(`Vehicle ${selectedVehicle?.VehicleNumber} successfully assigned to ${executiveName}`)

      setExecutiveName('')
      setSelectedVehicleId(undefined)
      setStartDate('')
      setExpectedReturnDate('')
      setPurpose('')

      setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicleId))

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
    <div
      style={{
        background: colors.surface,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        boxShadow: shadow.sm,
        padding: spacing.xl,
        maxWidth: 600,
      }}
    >
      {loading ? (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <Spinner size={SpinnerSize.medium} label="Loading available vehicles…" />
        </div>
      ) : (
        <>
          {error && (
            <MessageBar messageBarType={MessageBarType.error} styles={{ root: { marginBottom: spacing.lg } }}>
              {error}
            </MessageBar>
          )}
          {success && (
            <MessageBar messageBarType={MessageBarType.success} styles={{ root: { marginBottom: spacing.lg } }}>
              {success}
            </MessageBar>
          )}

          {vehicles.length === 0 && !loading ? (
            <div>
              <div style={{ color: colors.textSecondary }}>No vehicles are currently available for assignment.</div>
              <div style={{ marginTop: spacing.md }}>
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
  )
}

export default AssignVehiclePage
