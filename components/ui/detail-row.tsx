export const DetailRow = ({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)
