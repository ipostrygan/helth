'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { SelfCareActivitiesContent } from '../components/self-care-activities-content'

function SelfCareActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  return <SelfCareActivitiesContent openId={id} />
}

export default function Page() {
  return <Suspense><SelfCareActivityDetailPage /></Suspense>
}
