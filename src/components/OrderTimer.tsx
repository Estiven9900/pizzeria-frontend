import { Clock, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { calculateRemainingSeconds } from '../utils/orderHelpers'

interface OrderTimerProps {
  createdAt: number
  onCancel?: () => void
}

export function OrderTimer({ createdAt, onCancel }: OrderTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateRemainingSeconds(createdAt),
  )

  useEffect(() => {
    setTimeRemaining(calculateRemainingSeconds(createdAt))

    const intervalId = setInterval(() => {
      setTimeRemaining(calculateRemainingSeconds(createdAt))
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [createdAt])

  const isLocked = timeRemaining === 0

  const timerColorClass = useMemo(() => {
    if (timeRemaining < 15) {
      return 'text-red-500'
    }

    if (timeRemaining <= 30) {
      return 'text-orange-500'
    }

    return 'text-green-500'
  }, [timeRemaining])

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-gray-200 p-4">
      <div className={`flex items-center gap-2 transition-colors duration-300 ${timerColorClass}`}>
        {isLocked ? (
          <Lock className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Clock className="h-5 w-5" aria-hidden="true" />
        )}
        <p className="text-3xl font-bold tabular-nums">
          {isLocked ? 'Locked' : `${timeRemaining}s`}
        </p>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isLocked
            ? 'max-h-0 opacity-0 pointer-events-none'
            : 'max-h-12 opacity-100 pointer-events-auto'
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Cancel Order
        </button>
      </div>
    </div>
  )
}
