import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { fetchProductsCatalog } from '../services/api'
import type { Pizza, ProductConfig, Size } from '../types'
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
  availableProducts: {
    pizzas: Pizza[]
    sizes: Size[]
    productConfigs: ProductConfig[]
  }
  isLoadingProducts: boolean
  productsError: string | null
  cart: CartItem[]
  isCartOpen: boolean
  hasHydrated: boolean
  activeOrder: ActiveOrder | null
  timeRemaining: number
  isLocked: boolean
  fetchProducts: () => Promise<void>
  addToCart: (item: CartItem) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, delta: number) => void
  toggleCart: () => void
  setHasHydrated: (value: boolean) => void
  clearCart: () => void
  getTotalPrice: () => number
  setActiveOrder: (orderData?: SetActiveOrderInput) => void
  setOrderStatus: (status: OrderStatus) => void
  clearActiveOrder: () => void
  refreshOrderLock: () => void
}

export interface CartItem {
  cartItemId: string
  productConfigId: string
  name: string
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

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => {
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
        availableProducts: { pizzas: [], sizes: [], productConfigs: [] },
        isLoadingProducts: false,
        productsError: null,
        cart: [],
        isCartOpen: false,
        hasHydrated: false,
        activeOrder: null,
        timeRemaining: ORDER_LOCK_TIME_SECONDS,
        isLocked: false,
        fetchProducts: async () => {
          set({ isLoadingProducts: true, productsError: null })
          try {
            const data = await fetchProductsCatalog()
            set({ availableProducts: data, isLoadingProducts: false })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cargar productos'
            set({ productsError: message, isLoadingProducts: false })
          }
        },
        addToCart: (item) => {
          set((state) => {
            const existingItem = state.cart.find(
              (cartItem) => cartItem.productConfigId === item.productConfigId,
            )

            if (!existingItem) {
              const nextCart = [...state.cart, item]

              return {
                cart: nextCart,
              }
            }

            const nextCart = state.cart.map((cartItem) => {
              if (cartItem.productConfigId === item.productConfigId) {
                return {
                  ...cartItem,
                  quantity: cartItem.quantity + item.quantity,
                }
              }

              return cartItem
            })

            return {
              cart: nextCart,
            }
          })
        },
        removeFromCart: (cartItemId) => {
          set((state) => {
            const nextCart = state.cart.filter(
              (item) => item.cartItemId !== cartItemId,
            )

            return {
              cart: nextCart,
            }
          })
        },
        updateQuantity: (cartItemId, delta) => {
          set((state) => {
            const nextCart = state.cart
              .map((item) => {
                if (item.cartItemId !== cartItemId) {
                  return item
                }

                return {
                  ...item,
                  quantity: item.quantity + delta,
                }
              })
              .filter((item) => item.quantity > 0)

            return {
              cart: nextCart,
            }
          })
        },
        toggleCart: () => {
          set((state) => ({ isCartOpen: !state.isCartOpen }))
        },
        setHasHydrated: (value) => {
          set({ hasHydrated: value })
        },
        clearCart: () => {
          set({ cart: [] })

          if (typeof window !== 'undefined') {
            localStorage.removeItem('pizzaclick-order-storage')
          }
        },
        getTotalPrice: () => {
          return calculateOrderTotal(get().cart)
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
    },
    {
      name: 'pizzaclick-order-storage',
      skipHydration: typeof window === 'undefined',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      // Para verificar en Chrome DevTools: Application -> Local Storage -> busca la clave "pizzaclick-order-storage".
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
)
