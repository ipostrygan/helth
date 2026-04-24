'use client'

import { FileIcon, ImageIcon, XIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UploadedFile } from '@/components/custom/file-upload'

type StagedFileCardProps = {
  entry: UploadedFile
  onRemove: (id: string) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const StagedFileCard = ({ entry, onRemove }: StagedFileCardProps) => (
  <Card className="flex flex-row items-center gap-3 px-4 py-3 text-sm">
    {entry.file.type === 'application/pdf'
      ? <FileIcon className="size-4 text-muted-foreground shrink-0" />
      : <ImageIcon className="size-4 text-muted-foreground shrink-0" />}
    <span className="flex-1 truncate">{entry.file.name}</span>
    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(entry.file.size)}</span>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={() => onRemove(entry.id)}
      aria-label={`Remove ${entry.file.name}`}
    >
      <XIcon className="size-4" />
    </Button>
  </Card>
)
