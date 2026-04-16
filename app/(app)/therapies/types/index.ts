import type { BaseQueryParams } from '@/types'

export type TherapiesQueryParams = BaseQueryParams & {
  isActive?: string[] | null
}
