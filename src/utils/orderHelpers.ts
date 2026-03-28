export const ORDER_LOCK_TIME_SECONDS = 60

export const RESERVATION_TIME_MS = 10 * 60 * 1000 // 10 minutes

export function calculateRemainingSeconds(createdAt: number): number {
  const elapsedMs = Date.now() - createdAt
  const remainingMs = ORDER_LOCK_TIME_SECONDS * 1000 - elapsedMs

  return Math.max(0, Math.ceil(remainingMs / 1000))
}

export function calculateReservationRemaining(lockedAt: number): number {
  const elapsedMs = Date.now() - lockedAt
  const remainingMs = RESERVATION_TIME_MS - elapsedMs

  return Math.max(0, remainingMs)
}

export function formatMmSs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
