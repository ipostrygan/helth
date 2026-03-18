import { TabsNav } from "./tabs-nav"

export default function MedicalExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <TabsNav />
      {children}
    </div>
  )
}
