'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getTherapyAppointmentDocuments } from '@/lib/api/therapies'
import { queryKeys } from '@/lib/query-keys'

const PAGE_SIZE = 10

export const useTherapyAppointmentDocuments = (therapyId: string) => {
  return useInfiniteQuery({
    queryKey: queryKeys.therapies.appointmentDocuments(therapyId),
    queryFn: ({ pageParam }) => getTherapyAppointmentDocuments(therapyId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.page - 1) * lastPage.pageSize + lastPage.documents.length
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
    enabled: !!therapyId
  })
}
