import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { BaseQueryParams } from '@/types'

export function validateQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true, data: z.infer<T> } | { success: false, response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const details = Object.fromEntries(
      result.error.issues.map(i => [i.path.join('.'), i.message])
    )
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid query parameters', details },
        { status: 400 }
      )
    }
  }
  return { success: true, data: result.data }
}

export function buildSearchParams(
  base: BaseQueryParams,
  extras?: Record<string, string | string[] | null | undefined>
): URLSearchParams {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = 'date',
    sortDirection = 'desc',
    search = '',
    dateFrom,
    dateTo
  } = base

  const params = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {})
  })

  if (extras) {
    for (const [k, v] of Object.entries(extras)) {
      if (v === null || v === undefined) continue
      params.set(k, Array.isArray(v) ? v.join(',') : v)
    }
  }

  return params
}

export async function fetchOne<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to fetch: ${path}`)
  return res.json()
}

export async function deleteResource(path: string): Promise<void> {
  const res = await fetch(path, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete: ${path}`)
}

export async function uploadDocuments(basePath: string, files: File[]): Promise<{ keys: string[] }> {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const res = await fetch(`${basePath}/documents`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to upload documents')
  }
  return res.json()
}

export async function deleteDocument(basePath: string, key: string): Promise<void> {
  const res = await fetch(`${basePath}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  })
  if (!res.ok) throw new Error('Failed to delete document')
}
