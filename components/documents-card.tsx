'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { UseMutationResult } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCard } from '@/components/file-card'
import { StagedFileCard } from '@/components/staged-file-card'
import { FileUpload, type UploadedFile } from '@/components/custom/file-upload'
import { Button } from '@/components/ui/button'
import type { DocumentItem } from '@/lib/api/appointments'

type DocumentsCardProps = {
  documents: DocumentItem[]
  uploadMutation: UseMutationResult<void, Error, File[]>
  removeMutation: UseMutationResult<void, Error, string>
}

export const DocumentsCard = ({
  documents,
  uploadMutation,
  removeMutation
}: DocumentsCardProps) => {
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([])
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null)

  const pendingDoc = documents.find(d => d.key === pendingDeleteKey)

  const handleUpload = async () => {
    if (!stagedFiles.length) return
    await uploadMutation.mutateAsync(stagedFiles.map(f => f.file))
    setStagedFiles([])
  }

  const confirmDelete = async () => {
    if (!pendingDeleteKey) return
    await removeMutation.mutateAsync(pendingDeleteKey)
    setPendingDeleteKey(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b gap-0">
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(documents.length > 0 || stagedFiles.length > 0) && (
            <div className="flex flex-col gap-2 flex-1">
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <FileCard
                      key={doc.key}
                      file={{
                        id: doc.key,
                        name: doc.name,
                        url: doc.url,
                        downloadUrl: doc.downloadUrl
                      }}
                      onDelete={setPendingDeleteKey}
                    />
                  ))}
                </div>
              )}
              {stagedFiles.length > 0 && (
                <>
                  <div className="flex flex-col gap-2">
                    {stagedFiles.map(entry => (
                      <StagedFileCard
                        key={entry.id}
                        entry={entry}
                        onRemove={id => setStagedFiles(stagedFiles.filter(f => f.id !== id))}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    isPending={uploadMutation.isPending}
                    className="w-full"
                  >
                    {`Upload ${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''}`}
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="flex-1">
            <FileUpload value={stagedFiles} onChange={setStagedFiles} />
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!pendingDeleteKey}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteKey(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {' '}
              <span className="font-medium text-foreground">
                {pendingDoc?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending
                ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting…
                    </>
                  )
                : (
                    'Delete'
                  )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
