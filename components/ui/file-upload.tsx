'use client'

import { useCallback, useId, useState } from 'react'
import { UploadIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

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

function FileUpload({ value = [], onChange, maxFiles = 10, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
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

  if (value.length >= maxFiles) return null

  return (
    <Label
      htmlFor={inputId}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors font-normal',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        className
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
  )
}

export { FileUpload, type UploadedFile }
