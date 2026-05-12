'use client'

import { useProfiles } from '@/app/(app)/users/hooks/use-profiles'
import { getProfileDisplayName } from '@/app/(app)/users/utils/profile.utils'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type FamilyMemberSelectProps = {
  value: string | null
  onChange: (id: string) => void
}

export function FamilyMemberSelect({ value, onChange }: FamilyMemberSelectProps) {
  const { data: profiles = [] } = useProfiles()

  return (
    <Field>
      <Label required>Family member</Label>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a family member" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map(profile => (
            <SelectItem key={profile.id} value={profile.id}>
              {getProfileDisplayName(profile)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
