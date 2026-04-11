import prisma from '@/lib/prisma'
import { createDocumentHandlers } from '@/lib/api/documents'
import { addDocument, removeDocument } from '@/lib/document-actions'
import { getAppointmentById } from '@/app/actions/appointments'

export const { POST, DELETE } = createDocumentHandlers({
  getById: getAppointmentById,
  addDocument: (id, key) => addDocument(prisma.appointment, id, key),
  removeDocument: (id, key) => removeDocument(prisma.appointment, id, key)
})
