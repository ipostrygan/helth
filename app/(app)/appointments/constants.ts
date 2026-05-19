import { AppointmentStatus, AppointmentType } from '@/lib/generated/prisma'

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  Scheduled: 'Scheduled',
  Completed: 'Completed'
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  Primary: 'Primary examination',
  Secondary: 'Secondary examination',
  Dental: 'Dental',
  MentalHealth: 'Mental health',
  Lab: 'Lab',
  Emergency: 'Emergency',
  FollowUp: 'Follow-up',
  Vaccination: 'Vaccination',
  Other: 'Other'
}
