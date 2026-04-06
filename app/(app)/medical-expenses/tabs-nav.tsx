'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { label: 'Data', href: '/medical-expenses' },
  { label: 'Statistics', href: '/medical-expenses/statistics' }
]

export function TabsNav() {
  const pathname = usePathname()
  const activeTab = TABS.find(t => t.href === pathname)?.href ?? TABS[0].href

  return (
    <Tabs value={activeTab}>
      <TabsList className="p-0">
        {TABS.map(tab => (
          <TabsTrigger key={tab.href} value={tab.href} asChild>
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
