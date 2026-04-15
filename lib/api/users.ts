import type { UserProfile } from '@/app/(app)/users/types/profile.types'
import type { EditProfileFormType } from '@/app/(app)/profile/edit-profile-form'

const BASE = '/api/users'

export async function getProfiles(): Promise<UserProfile[]> {
  return fetch(BASE).then(res => res.json())
}

export async function getProfile(id: string): Promise<UserProfile | null> {
  return fetch(`${BASE}/${id}`).then(res => res.json())
}

export async function editProfile(
  id: string,
  data: EditProfileFormType
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? 'Failed to update profile')
  }
}

export async function uploadProfileImage(
  id: string,
  file: File
): Promise<Response> {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${BASE}/${id}/upload-image`, {
    method: 'PUT',
    body: formData
  })
}
