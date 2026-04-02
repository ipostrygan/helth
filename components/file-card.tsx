'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2 } from 'lucide-react'

export type DocumentFile = {
  id: string
  name: string
  url: string
  downloadUrl: string
  sizeKb?: number
}

type FileCardProps = {
  file: DocumentFile
  onDelete: (id: string) => void
}

export const FileCard = ({ file, onDelete }: FileCardProps) => (
  <Card
    className="flex flex-row items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors group cursor-pointer"
    onClick={() => window.open(file.url, '_blank')}
  >
    <FileText className="size-4 text-muted-foreground" />
    <span className="flex-1 truncate">{file.name}</span>
    {file.sizeKb != null && (
      <span className="text-xs text-muted-foreground shrink-0">
        {file.sizeKb}
        {' '}
        KB
      </span>
    )}
    <a
      href={file.downloadUrl}
      download={file.name}
      onClick={e => e.stopPropagation()}
      aria-label={`Download ${file.name}`}
      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
    >
      <Download className="size-4" />
    </a>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={(e) => { e.stopPropagation(); onDelete(file.id) }}
      aria-label={`Remove ${file.name}`}
    >
      <Trash2 className="size-4" />
    </Button>
  </Card>
)
