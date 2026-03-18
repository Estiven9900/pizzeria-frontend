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
  cart: CartItem[]
  activeOrder: ActiveOrder | null
  timeRemaining: number
  isLocked: boolean
  addToCart: (item: CartItem) => void
  removeFromCart: (pizzaId: string, sizeId: string) => void
  clearCart: () => void
  setActiveOrder: (orderData?: SetActiveOrderInput) => void
  setOrderStatus: (status: OrderStatus) => void
  clearActiveOrder: () => void
  refreshOrderLock: () => void
}

export interface CartItem {
  pizzaId: string
  name: string
  sizeId: string
  sizeName: string
  price: number
  quantity: number
}

interface SetActiveOrderInput {
  id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  delivery_address?: string
  reference_notes?: string
  status?: OrderStatus
}

export interface ActiveOrder {
  id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  delivery_address?: string
  reference_notes?: string
  status: OrderStatus
  total: number
  cart: CartItem[]
  created_at: Date | string | number
}

function calculateOrderTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
    cart: [],
    activeOrder: null,
    timeRemaining: ORDER_LOCK_TIME_SECONDS,
    isLocked: false,
    addToCart: (item) => {
      set((state) => {
        const existingItem = state.cart.find(
          (cartItem) =>
            cartItem.pizzaId === item.pizzaId && cartItem.sizeId === item.sizeId,
        )

        if (!existingItem) {
          return { cart: [...state.cart, item] }
        }

        return {
          cart: state.cart.map((cartItem) => {
            if (
              cartItem.pizzaId === item.pizzaId &&
              cartItem.sizeId === item.sizeId
            ) {
              return {
                ...cartItem,
                quantity: cartItem.quantity + item.quantity,
              }
            }

            return cartItem
          }),
        }
      })
    },
    removeFromCart: (pizzaId, sizeId) => {
      set((state) => ({
        cart: state.cart.filter(
          (item) => !(item.pizzaId === pizzaId && item.sizeId === sizeId),
        ),
      }))
    },
    clearCart: () => {
      set({ cart: [] })
    },
    setActiveOrder: (orderData) => {
      const currentOrder = get().activeOrder
      const currentCart = get().cart
      const createdAt = Date.now()
      const total = calculateOrderTotal(currentCart)

      set({
        activeOrder: {
          id: orderData?.id ?? currentOrder?.id ?? crypto.randomUUID(),
          customer_name:
            orderData?.customer_name ?? currentOrder?.customer_name ?? 'Cliente',
          customer_email:
            orderData?.customer_email ?? currentOrder?.customer_email,
          customer_phone:
            orderData?.customer_phone ?? currentOrder?.customer_phone,
          delivery_address:
            orderData?.delivery_address ?? currentOrder?.delivery_address,
          reference_notes:
            orderData?.reference_notes ?? currentOrder?.reference_notes,
          status: orderData?.status ?? 'Pending',
          total,
          cart: currentCart,
          created_at: createdAt,
        },
      })
      refreshOrderLock()

      stopCountdown()
      countdownTimer = setInterval(() => {
        refreshOrderLock()
      }, 1000)
    },
    setOrderStatus: (status) => {
      const order = get().activeOrder

      if (!order) {
        return
      }

      set({
        activeOrder: {
          ...order,
          status,
        },
      })
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
