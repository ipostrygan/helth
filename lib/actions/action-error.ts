export class ActionError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ActionError'
    this.status = status
  }
}
