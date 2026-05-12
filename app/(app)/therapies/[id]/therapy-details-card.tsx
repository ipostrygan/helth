import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DetailRow } from '@/components/custom/detail-row'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/custom/status-badge'
import { AppLink } from '@/components/custom/app-link'
import type { TherapyWithDocuments } from '@/lib/api/therapies'

interface TherapyDetailsCardProps {
  therapy: TherapyWithDocuments
  id: string
}

export const TherapyDetailsCard = ({ therapy, id }: TherapyDetailsCardProps) => (
  <Card>
    <CardHeader className="border-b gap-0 items-center">
      <CardTitle className="text-base">Details</CardTitle>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/therapies/${id}/edit`}>
          <Pencil className="size-4 mr-1" />
          Edit
        </Link>
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <DetailRow label="Status">
        <StatusBadge status={therapy.isActive ? 'Ongoing' : 'Finished'} />
      </DetailRow>
      <Separator />
      <DetailRow label="Start Date">
        {new Date(therapy.startDate).toLocaleDateString()}
      </DetailRow>
      <Separator />
      <DetailRow label="End Date">
        {therapy.endDate ? new Date(therapy.endDate).toLocaleDateString() : '—'}
      </DetailRow>
      <Separator />
      <DetailRow label="Description">
        {therapy.description ?? '—'}
      </DetailRow>
      <Separator />
      <DetailRow label="Specialists">
        {therapy.specialists.length === 0
          ? '—'
          : (
              <div className="space-y-1">
                {therapy.specialists.map(s =>
                  s.link
                    ? (
                        <div key={s.name}>
                          <AppLink href={s.link} external className="font-medium">
                            {s.name}
                          </AppLink>
                        </div>
                      )
                    : (
                        <div key={s.name}>{s.name}</div>
                      )
                )}
              </div>
            )}
      </DetailRow>
    </CardContent>
  </Card>
)
