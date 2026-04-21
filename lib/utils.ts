import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { User } from './generated/prisma'
import { UserProfile } from '@/app/(app)/users/types/profile.types'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export function validateFileSize(file: File, maxBytes = MAX_FILE_SIZE_BYTES): string | null {
  if (file.size > maxBytes) {
    const maxMB = maxBytes / (1024 * 1024)
    return `File "${file.name}" exceeds the ${maxMB} MB size limit.`
  }
  return null
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)

