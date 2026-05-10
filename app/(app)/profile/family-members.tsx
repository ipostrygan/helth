'use client'

import { useProfiles } from '../users/hooks/use-profiles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MemberItem from './member-item'

const FamilyMembers = () => {
  const { data: profiles = [], isLoading } = useProfiles()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family members</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading
          ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">Loading...</p>
            )
          : profiles.length === 0
            ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">No family members found.</p>
              )
            : (
                <div className="divide-y">
                  {profiles.map(profile => (
                    <MemberItem key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
      </CardContent>
    </Card>
  )
}

export default FamilyMembers
