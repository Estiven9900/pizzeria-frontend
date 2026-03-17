export const ORDER_LOCK_TIME_SECONDS = 60

export function calculateRemainingSeconds(createdAt: number): number {
  const elapsedMs = Date.now() - createdAt
  const remainingMs = ORDER_LOCK_TIME_SECONDS * 1000 - elapsedMs

  return Math.max(0, Math.ceil(remainingMs / 1000))
}
