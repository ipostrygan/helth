import Link, { type LinkProps } from 'next/link'
import { cn } from '@/lib/utils'

type SharedProps = {
  href: string
  className?: string
  children: React.ReactNode
}

type InternalProps = SharedProps & { external?: false } & Omit<LinkProps, keyof SharedProps>
type ExternalProps = SharedProps & { external: true } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps>

export type AppLinkProps = InternalProps | ExternalProps

const BASE_CLASS = 'text-primary hover:text-primary/80 transition-colors'

export function AppLink({ external, className, children, href, ...rest }: AppLinkProps) {
  const cls = cn(BASE_CLASS, className)

  const Tag = external ? 'a' : Link
  return <Tag href={href} className={cls} {...rest}>{children}</Tag>
}
