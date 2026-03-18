"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EditProfileFormType } from "../../profile/edit-profile-form"
import { profileQueryKey } from "./use-profile"
import { editProfile } from "@/lib/api/users"
import { toast } from "sonner"

export const useEditProfile = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditProfileFormType) => editProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey(id) })
      toast.success("Profile was successfully updated")
    },
    onError: () => {
      toast.error("Failed to update profile")
    }
  })
}
