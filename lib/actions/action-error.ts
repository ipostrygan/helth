import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

export class ActionError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ActionError'
    this.status = status
  }
}

export function handleActionError(e: unknown): never {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.code === 'P2025') throw new ActionError('Record not found', 404)
    if (e.code === 'P2002') throw new ActionError('Already exists', 409)
  }
  if (e instanceof PrismaClientValidationError) {
    throw new ActionError('Invalid data', 400)
  }
  console.error(e)
  throw new ActionError(e instanceof Error ? e.message : 'Something went wrong', 500)
}
