"use client"

import { use } from "react"
import { useActiveProfile } from "@/context/profile-context"
import { useTherapy } from "../../hooks/use-therapy"
import TherapyForm from "../../components/therapy-form"

type EditPageProps = {
  params: Promise<{ id: string }>
}

const EditTherapyPage = ({ params }: EditPageProps) => {
  const { id } = use(params)
  const { activeProfileId } = useActiveProfile()
  const { data: therapy, isLoading } = useTherapy(id)

  if (isLoading) return null
  if (!therapy || !activeProfileId) return null

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold">Edit Therapy</h1>
      </div>
      <TherapyForm profileId={activeProfileId} therapy={therapy} />
    </div>
  )
}

export default EditTherapyPage
