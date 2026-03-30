"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EditProfileFormType } from "../../profile/edit-profile-form"
import { editProfile } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"
import { toast } from "sonner"

export const useEditProfile = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditProfileFormType) => editProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(id) })
      toast.success("Profile was successfully updated")
    },
    onError: () => {
      toast.error("Failed to update profile")
    }
  })
}
