import { getAllProfiles } from "@/app/actions/profile"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import ProfileSwitcher from "./users/components/profile-switcher"
import { ProfileProvider } from "@/context/profile-context"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profiles = await getAllProfiles()

  return (
    <ProfileProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card px-2 h-18 flex items-center justify-between shrink-0 z-10">
            <SidebarTrigger />
            <ProfileSwitcher profiles={profiles} />
          </header>
          <main className="p-4 overflow-y-auto flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProfileProvider>
  )
}
