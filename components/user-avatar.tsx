'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { UserProfile } from '@/app/(app)/users/types/profile.types'
import { useUploadFile } from '@/app/(app)/users/hooks/use-file-upload'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const UserAvatar = ({
  profile,
  className,
  editable = false
}: {
  profile: UserProfile
  className?: string
  editable?: boolean
}) => {
  const { mutateAsync, isPending } = useUploadFile(profile.id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const displayName = profile.profileType === 'Human'
    ? `${profile.firstName} ${profile.lastName}`
    : profile.fullName

  const initials = profile.profileType === 'Human'
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : (profile.shortName ?? profile.fullName)[0].toUpperCase()
  const imageUrl = `/api/users/${profile.id}/image`

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB.')
      return
    }

    try {
      await mutateAsync(e)
    }
    catch {
      setError('Upload failed. Please try again.')
    }
    finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const avatarEl = (
    <Avatar className={cn('@container font-semibold', className ?? 'size-62.5')}>
      <AvatarFallback className="text-[33cqw]">{initials}</AvatarFallback>
      {imageUrl !== null && (
        <Image
          src={imageUrl}
          alt={`${displayName}'s avatar`}
          fill
          unoptimized
          loading="lazy"
          className={cn(
            'object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
      )}
    </Avatar>
  )

  if (!editable) return avatarEl

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'relative rounded-full group cursor-pointer',
          isPending && 'pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarEl}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity',
            isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {isPending
            ? <Loader2 className="text-white size-8 animate-spin" />
            : <Camera className="text-white size-8" />}
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}
    </div>
  )
}

export default UserAvatar
