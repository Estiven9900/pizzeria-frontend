import { useEffect, useState } from 'react'
import { calculateReservationRemaining } from '../utils/orderHelpers'

export function useTimer(lockedAt: number, onExpire?: () => void) {
  const [remainingMs, setRemainingMs] = useState(() =>
    calculateReservationRemaining(lockedAt),
  )

  useEffect(() => {
    setRemainingMs(calculateReservationRemaining(lockedAt))

    const intervalId = setInterval(() => {
      const remaining = calculateReservationRemaining(lockedAt)
      setRemainingMs(remaining)

      if (remaining === 0) {
        clearInterval(intervalId)
        onExpire?.()
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [lockedAt, onExpire])

  return remainingMs
}
