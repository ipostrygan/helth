'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import type { ComponentProps } from 'react'
import { useEffect } from 'react'

function ThemeStorageSync({ storageKey = 'theme' }: { storageKey?: string }) {
  const { theme } = useTheme()

  useEffect(() => {
    if (theme && !localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeStorageSync storageKey={typeof props.storageKey === 'string' ? props.storageKey : 'theme'} />
      {children}
    </NextThemesProvider>
  )
}
