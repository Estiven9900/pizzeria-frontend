import { create } from 'zustand'

    import type { OrderStatus } from '../types/pizza'

const ORDER_LOCK_TIME_SECONDS = 60

let countdownTimer: ReturnType<typeof setInterval> | null = null

export function calculateTimeRemaining(createdAt: Date | string): number {
  const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt)
  const elapsedMs = Date.now() - createdAtDate.getTime()
  const remainingMs = ORDER_LOCK_TIME_SECONDS * 1000 - elapsedMs

  return Math.max(0, Math.ceil(remainingMs / 1000))
}

interface OrderStore {
  activeOrder: ActiveOrder | null
  timeRemaining: number
  isLocked: boolean
  setActiveOrder: (order: ActiveOrder) => void
  clearActiveOrder: () => void
  refreshOrderLock: () => void
}

export interface ActiveOrder {
  id: string
  customer_name: string
  status: OrderStatus
  created_at: Date | string
}

const stopCountdown = () => {
  if (!countdownTimer) {
    return
  }

  clearInterval(countdownTimer)
  countdownTimer = null
}

export const useOrderStore = create<OrderStore>((set, get) => {
  const refreshOrderLock = () => {
    const order = get().activeOrder

    if (!order) {
      set({ timeRemaining: ORDER_LOCK_TIME_SECONDS, isLocked: false })
      stopCountdown()
      return
    }

    const timeRemaining = calculateTimeRemaining(order.created_at)
    const isLocked = timeRemaining === 0

    set({ timeRemaining, isLocked })

    if (isLocked) {
      stopCountdown()
    }
  }

  return {
    activeOrder: null,
    timeRemaining: ORDER_LOCK_TIME_SECONDS,
    isLocked: false,
    setActiveOrder: (order) => {
      set({ activeOrder: order })
      refreshOrderLock()

      stopCountdown()
      countdownTimer = setInterval(() => {
        refreshOrderLock()
      }, 1000)
    },
    clearActiveOrder: () => {
      stopCountdown()
      set({
        activeOrder: null,
        timeRemaining: ORDER_LOCK_TIME_SECONDS,
        isLocked: false,
      })
    },
    refreshOrderLock,
  }
})
