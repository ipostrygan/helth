import { User } from '@/lib/generated/prisma/client'

export type UserProfile = Omit<User, 'imageKey'> & {
  imageKey: string | null
}
