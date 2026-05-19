'use client'

import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
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

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function isImage(name: string) {
  return IMAGE_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext))
}

export const FileCard = ({ file, onDelete }: FileCardProps) => {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  function handleCardClick() {
    if (!isMobile && !isImage(file.name)) {
      window.open(file.url, '_blank', 'noopener,noreferrer')
    }
    else {
      setOpen(true)
    }
  }

  return (
    <>
      <Card
        className="flex flex-row items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors group cursor-pointer"
        onClick={handleCardClick}
      >
        <FileText className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate">{file.name}</span>
        {!!file.sizeKb && (
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
          onClick={(e) => {
            e.stopPropagation()
            onDelete(file.id)
          }}
          aria-label={`Remove ${file.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col max-w-[95vw] w-full h-[90vh] p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="text-sm font-medium truncate pr-8">{file.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {isImage(file.name)
              ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )
              : (
                  <iframe
                    src={file.url}
                    title={file.name}
                    className="w-full h-full border-0"
                  />
                )}
          </div>
          <DialogFooter className="px-4 py-3 border-t shrink-0">
            <a href={file.downloadUrl} download={file.name}>
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Download
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
