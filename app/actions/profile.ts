'use server'

import { EditProfileFormType } from '../(app)/profile/edit-profile-form'
import prisma from '@/lib/prisma'
import { toUserProfile } from '@/lib/utils'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

export const editProfile = async (id: string, data: EditProfileFormType) => {
  try {
    await prisma.user.update({ where: { id }, data })
    return { error: null, status: 200 }
  }
  catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      return { error: 'User not found', status: 404 }
    }
    if (e instanceof PrismaClientValidationError) {
      return { error: 'Invalid data', status: 400 }
    }
    return { error: e instanceof Error ? e.message : 'Failed to update profile', status: 500 }
  }
}

export const getProfile = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return { error: 'User not found', data: null, status: 404 }
    return { error: null, data: toUserProfile(user), status: 200 }
  }
  catch (e) {
    if (e instanceof PrismaClientValidationError) {
      return { error: 'Invalid data', data: null, status: 400 }
    }
    return { error: e instanceof Error ? e.message : 'Failed to fetch profile', data: null, status: 500 }
  }
}

export const getAllProfiles = async () => {
  try {
    const users = await prisma.user.findMany()
    return { error: null, data: await Promise.all(users.map(toUserProfile)), status: 200 }
  }
  catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to fetch profiles', data: null, status: 500 }
  }
}
