import { useEffect, useState } from 'react'

export function useCountdown(expiresAt: number, onExpire?: () => void) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, expiresAt - Date.now()),
  )

  useEffect(() => {
    const remaining = Math.max(0, expiresAt - Date.now())
    setRemainingMs(remaining)

    if (remaining === 0) {
      onExpire?.()
      return
    }

    const intervalId = setInterval(() => {
      const ms = Math.max(0, expiresAt - Date.now())
      setRemainingMs(ms)

      if (ms === 0) {
        clearInterval(intervalId)
        onExpire?.()
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [expiresAt, onExpire])

  return remainingMs
}
