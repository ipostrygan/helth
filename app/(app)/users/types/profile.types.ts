import { User } from '@/lib/generated/prisma/client'

type UserBase = Omit<User, 'imageKey' | 'profileType' | 'firstName' | 'lastName' | 'fullName' | 'height'> & {
  imageKey: string | null
}

export type HumanProfile = UserBase & {
  profileType: 'Human'
  firstName: string
  lastName: string
  fullName: null
  height: number | null
}

export type AnimalProfile = UserBase & {
  profileType: 'Animal'
  fullName: string
  firstName: null
  lastName: null
  height: null
}

export type UserProfile = HumanProfile | AnimalProfile

export function getProfileDisplayName(profile: UserProfile): string {
  return profile.profileType === 'Human' ? profile.firstName : profile.fullName
}
