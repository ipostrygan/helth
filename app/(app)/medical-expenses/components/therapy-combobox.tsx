'use client'

import { useMemo, useState } from 'react'
import { useTherapies } from '@/app/(app)/therapies/hooks/use-therapies'
import { SearchCombobox } from '@/components/search-combobox'

type TherapyComboboxProps = {
  profileId: string
  value?: string | null
  onChange: (value: string | null) => void
  selectedItem?: { id: string, title: string } | null
}

export function TherapyCombobox({ profileId, value, onChange, selectedItem }: TherapyComboboxProps) {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useTherapies({ profileId, search, pageSize: 20 })

  const items = useMemo(() => {
    const fetched = (data?.data ?? []).map(t => ({ id: t.id, label: t.title }))
    if (selectedItem && !fetched.some(i => i.id === selectedItem.id)) {
      return [{ id: selectedItem.id, label: selectedItem.title }, ...fetched]
    }
    return fetched
  }, [data, selectedItem])

  return (
    <SearchCombobox
      value={value}
      onChange={onChange}
      items={items}
      isLoading={isLoading}
      onSearchChange={setSearch}
      placeholder="Select a therapy…"
      searchPlaceholder="Search therapies…"
      emptyText="No therapies found."
    />
  )
}
