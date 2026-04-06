'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useTherapy } from '../../hooks/use-therapy'
import TherapyForm, { type TherapyFormValues } from '../../components/therapy-form'
import { useEditTherapy } from '../../hooks/use-edit-therapy'

type EditPageProps = {
  params: Promise<{ id: string }>
}

const EditTherapyPage = ({ params }: EditPageProps) => {
  const { id } = use(params)
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { data: therapy, isLoading } = useTherapy(id)
  const { mutateAsync: editTherapy } = useEditTherapy()

  if (isLoading) return null
  if (!therapy || !activeProfileId) return null

  const onSubmit = async (values: TherapyFormValues) => {
    await editTherapy({ id: therapy.id, ...values })
    router.push(`/therapies/${therapy.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6 space-y-1">
        <Breadcrumbs items={[{ label: 'Therapies', href: '/therapies' }, { label: therapy.title, href: `/therapies/${id}` }, { label: 'Edit' }]} />
        <h1 className="text-2xl font-semibold">Edit Therapy</h1>
      </div>
      <TherapyForm therapy={therapy} onSubmit={onSubmit} />
    </div>
  )
}

export default EditTherapyPage
