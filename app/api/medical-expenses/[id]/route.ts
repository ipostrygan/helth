import { NextRequest, NextResponse } from 'next/server'
import { deleteExpense, getMedicalExpenseById } from '../../../actions/medical-expenses'
import { actionErrorResponse } from '@/lib/api/utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await getMedicalExpenseById(id)
    if (!item) return new NextResponse(null, { status: 404 })
    return NextResponse.json(item)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await deleteExpense(id)
    return new NextResponse(null, { status: 204 })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
