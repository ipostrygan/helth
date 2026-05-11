import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { ActionError } from './action-error'

export { ActionError }

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
