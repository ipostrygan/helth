import { User } from '@/lib/generated/prisma/client'

export type UserProfile = Omit<User, 'imageKey'> & {
  imageUrl: string | null
  imageKey: string | null
}
