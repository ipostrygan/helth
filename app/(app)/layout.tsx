import { getAllProfiles } from "@/app/actions/profile"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import ProfileSwitcher from "./users/components/profile-switcher"
import { ProfileProvider } from "@/context/profile-context"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profiles = await getAllProfiles()

  return (
    <ProfileProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-card px-2 h-18 flex items-center justify-end">
            <ProfileSwitcher profiles={profiles} />
          </header>
          <main className="p-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProfileProvider>
  )
}
