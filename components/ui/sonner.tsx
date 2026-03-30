"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-500" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "oklch(0.97 0.02 160)",
          "--success-text": "oklch(0.35 0.1 160)",
          "--success-border": "oklch(0.85 0.06 160)",
          "--error-bg": "oklch(0.97 0.02 25)",
          "--error-text": "oklch(0.35 0.1 25)",
          "--error-border": "oklch(0.85 0.06 25)",
          "--warning-bg": "oklch(0.97 0.04 90)",
          "--warning-text": "oklch(0.35 0.1 90)",
          "--warning-border": "oklch(0.85 0.08 90)",
          "--info-bg": "oklch(0.97 0.02 240)",
          "--info-text": "oklch(0.35 0.1 240)",
          "--info-border": "oklch(0.85 0.06 240)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
