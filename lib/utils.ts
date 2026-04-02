import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { User } from './generated/prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)

export const toUserProfile = (user: User) => ({
  ...user,
  imageUrl: user.imageKey ? `/api/download?key=${encodeURIComponent(user.imageKey)}` : null
})
