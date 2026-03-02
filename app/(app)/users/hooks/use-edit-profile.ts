"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EditProfileFormType } from "../../profile/edit-profile-form"
import { profileQueryKey } from "./use-profile"

export const useEditProfile = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditProfileFormType) => fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey(id) })
    }
  })
}
