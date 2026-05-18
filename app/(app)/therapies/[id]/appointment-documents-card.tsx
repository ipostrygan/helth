'use client'

import { DocumentsCard } from '@/components/documents-card'
import { useTherapyAppointmentDocuments } from '../hooks/use-therapy-appointment-documents'
import { useTherapyAppointmentDocumentMutations } from '../hooks/use-therapy-appointment-document-mutations'

type TherapyDocumentsCardProps = {
  therapyId: string
}

export const TherapyDocumentsCard = ({ therapyId }: TherapyDocumentsCardProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage }
    = useTherapyAppointmentDocuments(therapyId)

  const documents = data?.pages.flatMap(p => p.documents) ?? []

  const { uploadMutation, removeMutation } = useTherapyAppointmentDocumentMutations(therapyId)

  if (isLoading) return null

  return (
    <DocumentsCard
      documents={documents}
      uploadMutation={uploadMutation}
      removeMutation={removeMutation}
      hasMore={hasNextPage}
      onLoadMore={() => fetchNextPage()}
      isLoadingMore={isFetchingNextPage}
    />
  )
}
