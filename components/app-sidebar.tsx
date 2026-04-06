'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Stethoscope, Receipt, Sparkles, BriefcaseMedical } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'

export const MENU_ITEMS = [
  {
    name: 'Appointments',
    href: '/appointments',
    icon: CalendarDays
  },
  {
    name: 'Therapies',
    href: '/therapies',
    icon: Stethoscope
  },
  {
    name: 'Medical expenses',
    href: '/medical-expenses',
    icon: Receipt
  },
  {
    name: 'Self-care',
    href: '/self-care',
    icon: Sparkles
  }
]

function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mb-6 font-semibold text-xl p-4 flex flex-row items-center justify-between">
        <Link href="/"><BriefcaseMedical /></Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
            <X />
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {MENU_ITEMS.map(({ href, name, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={(pathname + '/').startsWith(href + '/')} tooltip={name}>
                <Link href={href} onClick={() => isMobile && setOpenMobile(false)}>
                  <Icon />
                  {name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 items-end">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
