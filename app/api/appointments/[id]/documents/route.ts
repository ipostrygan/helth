import { createDocumentHandlers } from '@/lib/api/documents'
import { addDocumentToAppointment, removeDocumentFromAppointment, getAppointmentById } from '@/app/actions/appointments'

export const { POST, DELETE } = createDocumentHandlers({
  getById: getAppointmentById,
  addDocument: addDocumentToAppointment,
  removeDocument: removeDocumentFromAppointment
})
