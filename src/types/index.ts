export interface Vehicle {
  VehicleId: string
  VehicleNumber: string
  Model: string
  Status: 'Available' | 'Assigned' | string
}

export interface Assignment {
  AssignmentId: string
  ExecutiveName: string
  Vehicle: Vehicle | { VehicleId: string; VehicleNumber?: string }
  StartDate: string // ISO
  ExpectedReturnDate: string // ISO
  Status: 'Active' | 'Completed' | string
}
