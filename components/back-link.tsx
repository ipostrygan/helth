import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type BackLinkProps = {
  href: string
  label?: string
}

export const BackLink = ({ href, label = 'Back' }: BackLinkProps) => (
  <Link href={href} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
    <ChevronLeft className="h-4 w-4" />
    {label}
  </Link>
)
