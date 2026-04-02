import { Skeleton } from '@/components/ui/skeleton'

const ProfileSkeleton = () => {
  return (
    <div className="max-w-3xl m-auto">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="text-center mt-4">
        <div className="flex justify-center">
          <Skeleton className="size-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto mt-3" />
        <Skeleton className="h-6 w-24 mx-auto mt-2" />
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <Skeleton className="h-5 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileSkeleton
