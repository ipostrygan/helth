'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDocuments = (apiPath: string, queryKey: readonly string[]) => {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch(apiPath, { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  const removeMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(apiPath, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })
      if (!res.ok) throw new Error('Delete failed')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  })

  return { uploadMutation, removeMutation }
}
