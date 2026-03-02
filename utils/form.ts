import { FieldValues } from "react-hook-form"

export function getDirtyValues<T extends FieldValues>(
  values: T,
  dirtyFields: Partial<Record<keyof T, unknown>>
) {
  return Object.fromEntries(
    Object.keys(dirtyFields).map(key => [key, values[key]])
  )
}
