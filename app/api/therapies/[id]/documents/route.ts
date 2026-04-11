import prisma from '@/lib/prisma'
import { createDocumentHandlers } from '@/lib/api/documents'
import { addDocument, removeDocument } from '@/lib/document-actions'
import { getTherapyById } from '@/app/actions/therapies'

export const { POST, DELETE } = createDocumentHandlers({
  getById: getTherapyById,
  addDocument: (id, key) => addDocument(prisma.therapy, id, key),
  removeDocument: (id, key) => removeDocument(prisma.therapy, id, key)
})
