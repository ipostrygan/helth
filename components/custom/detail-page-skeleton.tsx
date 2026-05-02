import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableSkeleton } from '@/components/custom/table-skeleton'

const widths = ['w-24', 'w-20', 'w-28', 'w-20', 'w-36', 'w-32', 'w-40', 'w-48', 'w-56']

const DetailRowSkeleton = ({ index }: { index: number }) => (
  <div className="flex flex-col gap-1">
    <Skeleton className="h-4 w-16" />
    <Skeleton className={`h-4 ${widths[index % widths.length]}`} />
  </div>
)

interface TableSection {
  headerWidth?: string
  rows?: number
  columns?: number
}

interface DetailPageSkeletonProps {
  detailRows?: number
  tableSections?: TableSection[]
}

export const DetailPageSkeleton = ({ detailRows = 5, tableSections }: DetailPageSkeletonProps) => (
  <div className="sm:px-6 sm:pt-6 space-y-6 max-w-4xl mx-auto">
    <div className="space-y-1">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-56" />
    </div>

    <Card>
      <CardHeader className="border-b gap-0 flex-row items-center justify-between">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: detailRows }).flatMap((_, i) =>
          i === 0
            ? [<DetailRowSkeleton key={i} index={i} />]
            : [<Separator key={`sep-${i}`} />, <DetailRowSkeleton key={i} index={i} />]
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="border-b gap-0">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full rounded-md" />
      </CardContent>
    </Card>

    {tableSections?.map((section, i) => (
      <Card key={i}>
        <CardHeader className="border-b gap-0">
          <Skeleton className={`h-5 ${section.headerWidth ?? 'w-36'}`} />
        </CardHeader>
        <CardContent className="p-0">
          <TableSkeleton rows={section.rows} columns={section.columns} />
        </CardContent>
      </Card>
    ))}
  </div>
)
