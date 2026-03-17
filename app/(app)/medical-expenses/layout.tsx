"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { label: "Data",       href: "/medical-expenses" },
  { label: "Statistics", href: "/medical-expenses/statistics" },
]

export default function MedicalExpensesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeTab = TABS.find((t) => t.href === pathname)?.href ?? TABS[0].href

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  )
}
