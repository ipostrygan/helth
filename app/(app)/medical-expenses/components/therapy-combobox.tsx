"use client"

import { useState } from "react"
import { useTherapies } from "@/app/(app)/therapies/hooks/use-therapies"
import { SearchCombobox } from "@/components/search-combobox"

type TherapyComboboxProps = {
  profileId: string
  value?: string | null
  onChange: (value: string | null) => void
}

export function TherapyCombobox({ profileId, value, onChange }: TherapyComboboxProps) {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useTherapies({ profileId, search, pageSize: 20 })
  const { data: allData } = useTherapies({ profileId, pageSize: 100 })

  const items = (data?.data ?? []).map((t) => ({ id: t.id, label: t.title }))
  const selectedLabel = value
    ? (allData?.data ?? []).find((t) => t.id === value)?.title
    : undefined

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
      selectedLabel={selectedLabel}
    />
  )
}
