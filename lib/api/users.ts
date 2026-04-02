import type { UserProfile } from '@/app/(app)/users/types/profile.types'
import type { EditProfileFormType } from '@/app/(app)/profile/edit-profile-form'

export async function getProfile(id: string): Promise<UserProfile | null> {
  return fetch(`/api/users/${id}`).then(res => res.json())
}

export async function editProfile(
  id: string,
  data: EditProfileFormType
): Promise<Response> {
  return fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function uploadProfileImage(
  id: string,
  file: File
): Promise<Response> {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`/api/users/${id}/upload-image`, {
    method: 'PUT',
    body: formData
  })
}
