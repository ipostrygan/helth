'use server'

import { EditProfileFormType } from '../(app)/profile/edit-profile-form'
import prisma from '@/lib/prisma'
import { toUserProfile } from '@/lib/utils'

export const editProfile = async (id: string, data: EditProfileFormType) => {
  await prisma.user.update({
    where: { id },
    data
  })
}

export const getProfile = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')
  return toUserProfile(user)
}

export const getAllProfiles = async () => {
  const users = await prisma.user.findMany()
  return Promise.all(users.map(toUserProfile))
}
