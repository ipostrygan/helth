"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Stethoscope, Receipt, Sparkles, BriefcaseMedical } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

export const MENU_ITEMS = [
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    name: "Therapies",
    href: "/therapies",
    icon: Stethoscope,
  },
  {
    name: "Medical expenses",
    href: "/medical-expenses",
    icon: Receipt,
  },
  {
    name: "Self-care",
    href: "/self-care",
    icon: Sparkles,
  },
]

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="mb-6 font-semibold text-xl p-4">
        <BriefcaseMedical />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {MENU_ITEMS.map(({ href, name, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={pathname === href}>
                <Link href={href}>
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
