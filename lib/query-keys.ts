import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import type { SelfCareActivitiesQueryParams } from '@/app/(app)/self-care-activities/types'
import type { ExpensesByTypeQuery } from '@/app/actions/medical-expenses'

export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    list: (params: AppointmentsQueryParams) => ['appointments', params] as const,
    detail: (id: string) => ['appointments', id] as const
  },
  therapies: {
    all: ['therapies'] as const,
    list: (params: TherapiesQueryParams) => ['therapies', params] as const,
    detail: (id: string) => ['therapies', id] as const
  },
  medicalExpenses: {
    all: ['medical-expenses'] as const,
    list: (params: MedicalExpensesQueryParams) => ['medical-expenses', params] as const,
    detail: (id: string) => ['medical-expenses', id] as const,
    byType: (params: ExpensesByTypeQuery) => ['medical-expenses-by-type', params] as const
  },
  selfCareActivities: {
    all: ['self-care-activities'] as const,
    list: (params: SelfCareActivitiesQueryParams) => ['self-care-activities', params] as const,
    detail: (id: string) => ['self-care-activities', id] as const
  },
  profile: {
    all: ['profile'] as const,
    detail: (id: string | null) => ['profile', id] as const
  }
}
