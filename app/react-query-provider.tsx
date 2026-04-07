'use client'

import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from 'react'

type ReactQueryProviderProps = {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
            retry: false
          }
        }
      })
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
