import { create } from 'zustand'

import { calculateRemainingSeconds, ORDER_LOCK_TIME_SECONDS } from '../utils/orderHelpers'
import type { OrderStatus } from '../types/pizza'

let countdownTimer: ReturnType<typeof setInterval> | null = null

function getCreatedAtTimestamp(createdAt: Date | string | number): number {
  if (typeof createdAt === 'number') {
    return createdAt
  }

  const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt)

  return createdAtDate.getTime()
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
  customer_email?: string
  customer_phone?: string
  delivery_address?: string
  reference_notes?: string
  status: OrderStatus
  created_at: Date | string | number
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

    const timeRemaining = calculateRemainingSeconds(
      getCreatedAtTimestamp(order.created_at),
    )
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
