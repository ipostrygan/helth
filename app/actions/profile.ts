'use server'

import { EditProfileFormType } from '../(app)/profile/edit-profile-form'
import prisma from '@/lib/prisma'
import { handleActionError, ActionError } from '@/lib/actions/handle-action-error'

export const editProfile = async (id: string, data: EditProfileFormType) => {
  try {
    await prisma.user.update({ where: { id }, data })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const getProfile = async (id: string) => {
  try {
    const data = await prisma.user.findUnique({ where: { id } })
    if (!data) throw new ActionError('User not found', 404)
    return data
  }
  catch (e) {
    handleActionError(e)
  }
}

export const getAllProfiles = async () => {
  try {
    return await prisma.user.findMany()
  }
  catch (e) {
    handleActionError(e)
  }
}
