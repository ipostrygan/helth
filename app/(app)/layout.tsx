import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/app-sidebar'
import ProfileSwitcher from './users/components/profile-switcher'
import { ProfileProvider } from '@/context/profile-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full min-w-0">
          <header className="sticky top-0 bg-card px-2 h-18 flex items-center justify-between shrink-0 z-10">
            <SidebarTrigger />
            <ProfileSwitcher />
          </header>
          <main className="p-4 flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProfileProvider>
  )
}
