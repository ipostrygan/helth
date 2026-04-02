import { createDocumentHandlers } from '@/lib/api/documents'
import { addDocumentToTherapy, removeDocumentFromTherapy, getTherapyById } from '@/app/actions/therapies'

export const { POST, DELETE } = createDocumentHandlers({
  getById: getTherapyById,
  addDocument: addDocumentToTherapy,
  removeDocument: removeDocumentFromTherapy
})
