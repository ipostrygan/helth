'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { AppointmentDocumentsResult } from '@/lib/api/therapies'

export const useTherapyAppointmentDocumentMutations = (therapyId: string) => {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch(`/api/therapies/${therapyId}/documents`, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapies.appointmentDocuments(therapyId)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapies.detail(therapyId)
      })
    }
  })

  const removeMutation = useMutation({
    mutationFn: async (key: string) => {
      const cached = queryClient.getQueryData<
        InfiniteData<AppointmentDocumentsResult>
      >(queryKeys.therapies.appointmentDocuments(therapyId))
      const doc = cached?.pages
        .flatMap(p => p.documents)
        .find(d => d.key === key)

      const res = await fetch(
        `/api/therapies/${therapyId}/appointment-documents`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            key,
            ...(doc?.appointmentId ? { appointmentId: doc.appointmentId } : {})
          })
        }
      )
      if (!res.ok) throw new Error('Delete failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapies.appointmentDocuments(therapyId)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapies.detail(therapyId)
      })
    }
  })

  return { uploadMutation, removeMutation }
}
