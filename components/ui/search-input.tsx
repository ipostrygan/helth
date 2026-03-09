"use client"

import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

const DEBOUNCE_TIME = 250

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchInput = ({ value, onChange, placeholder = "Search..." }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(next), DEBOUNCE_TIME)
  }

  return (
    <div className="relative w-64">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        className="pl-8"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}
