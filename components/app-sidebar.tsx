'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CalendarDays, Stethoscope, Receipt, Heart } from 'lucide-react'
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
    icon: Heart
  }
]

function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mb-6 font-semibold text-xl p-2 flex flex-row items-center justify-between">
        <Link href="/" className="group-data-[collapsible=icon]:hidden w-full">
          <Image src="/images/logo-rectangle.svg" alt="Helth" width={148} height={40} className="object-contain w-full" />
        </Link>
        <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
          <Image src="/images/logo-circle.svg" alt="Helth" width={47} height={47} className="object-contain w-full h-auto" />
        </Link>
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
