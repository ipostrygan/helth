'use client'

import { useCallback, useId, useState } from 'react'
import { FileIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

type UploadedFile = {
  id: string
  file: File
}

type FileUploadProps = {
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
  maxFiles?: number
  className?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const ACCEPTED_ATTR = 'image/*,application/pdf'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileUpload({ value = [], onChange, maxFiles = 10, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const inputId = useId()

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming).filter(f => ACCEPTED_TYPES.includes(f.type))
      if (!files.length) return

      const newEntries: UploadedFile[] = files.slice(0, maxFiles - value.length).map(file => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file
      }))

      onChange?.([...value, ...newEntries])
    },
    [value, onChange, maxFiles]
  )

  const confirmRemove = () => {
    if (!pendingRemoveId) return
    onChange?.(value.filter(f => f.id !== pendingRemoveId))
    setPendingRemoveId(null)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const canAddMore = value.length < maxFiles

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {canAddMore && (
        <Label
          htmlFor={inputId}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors font-normal',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <UploadIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop files here or
              {' '}
              <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Images (JPG, PNG, GIF, WebP) and PDF files</p>
          </div>
          <input
            id={inputId}
            type="file"
            multiple
            accept={ACCEPTED_ATTR}
            className="sr-only"
            onChange={onInputChange}
          />
        </Label>
      )}

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map(entry => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <div className="flex size-10 items-center justify-center rounded bg-muted shrink-0">
                {entry.file.type === 'application/pdf'
                  ? (
                      <FileIcon className="size-5 text-muted-foreground" />
                    )
                  : (
                      <ImageIcon className="size-5 text-muted-foreground" />
                    )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(entry.file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setPendingRemoveId(entry.id)}
                aria-label={`Remove ${entry.file.name}`}
              >
                <XIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!pendingRemoveId} onOpenChange={open => !open && setPendingRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove file</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove
              {' '}
              <span className="font-medium text-foreground">
                {value.find(f => f.id === pendingRemoveId)?.file.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRemoveId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { FileUpload, type UploadedFile }
