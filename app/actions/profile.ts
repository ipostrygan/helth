"use server"

import { User } from "@/lib/generated/prisma/client";
import { getSignedImageUrl } from "@/lib/s3";
import { EditProfileFormType } from "../(app)/profile/edit-profile-form";
import prisma from "@/lib/prisma";
import { UserProfile } from "../(app)/users/types/profile.types";

export const editProfile = async (id: string, data: EditProfileFormType) => {
  await prisma.user.update({
    where: { id },
    data
  })
}

export const toUserProfile = async (user: User): Promise<UserProfile> => ({
  ...user,
  imageUrl: user.imageKey ? await getSignedImageUrl(user.imageKey) : null
})

export const getProfile = async (id: string): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error("User not found")
  return toUserProfile(user)
}

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const users = await prisma.user.findMany()
  return Promise.all(users.map(toUserProfile))
}
