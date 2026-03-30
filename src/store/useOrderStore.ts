import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { fetchCatalog } from '../services/productService'
import type { CatalogPizza, CatalogSize } from '../services/productService'
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
  catalog: CatalogPizza[]
  isLoading: boolean
  catalogError: string | null
  cart: CartItem[]
  isCartOpen: boolean
  hasHydrated: boolean
  activeOrder: ActiveOrder | null
  timeRemaining: number
  isLocked: boolean
  loadCatalog: () => Promise<void>
  addToCart: (productConfigId: string, quantity: number) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, delta: number) => void
  toggleCart: () => void
  setHasHydrated: (value: boolean) => void
  clearCart: () => void
  getTotalPrice: () => number
  getCartItemView: () => CartItemView[]
  findCatalogSize: (productConfigId: string) => (CatalogSize & { pizzaName: string }) | undefined
  setActiveOrder: (orderData?: SetActiveOrderInput) => void
  setOrderStatus: (status: OrderStatus) => void
  clearActiveOrder: () => void
  refreshOrderLock: () => void
}

export interface CartItem {
  cartItemId: string
  productConfigId: string
  quantity: number
}

export interface CartItemView {
  cartItemId: string
  productConfigId: string
  displayName: string
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

const stopCountdown = () => {
  if (!countdownTimer) {
    return
  }

  clearInterval(countdownTimer)
  countdownTimer = null
}

function findSizeInCatalog(
  catalog: CatalogPizza[],
  productConfigId: string,
): (CatalogSize & { pizzaName: string }) | undefined {
  for (const pizza of catalog) {
    const size = pizza.sizes.find((s) => s.product_config_id === productConfigId)

    if (size) {
      return { ...size, pizzaName: pizza.pizzaName }
    }
  }

  return undefined
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
        catalog: [],
        isLoading: false,
        catalogError: null,
        cart: [],
        isCartOpen: false,
        hasHydrated: false,
        activeOrder: null,
        timeRemaining: ORDER_LOCK_TIME_SECONDS,
        isLocked: false,
        loadCatalog: async () => {
          set({ isLoading: true, catalogError: null })
          try {
            const data = await fetchCatalog()
            set({ catalog: data.pizzas, isLoading: false })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cargar el catálogo'
            set({ catalogError: message, isLoading: false })
          }
        },
        addToCart: (productConfigId, quantity) => {
          set((state) => {
            const existingItem = state.cart.find(
              (cartItem) => cartItem.productConfigId === productConfigId,
            )

            if (!existingItem) {
              const nextCart = [...state.cart, {
                cartItemId: crypto.randomUUID(),
                productConfigId,
                quantity,
              }]

              return {
                cart: nextCart,
              }
            }

            const nextCart = state.cart.map((cartItem) => {
              if (cartItem.productConfigId === productConfigId) {
                return {
                  ...cartItem,
                  quantity: cartItem.quantity + quantity,
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
          const { cart, catalog } = get()

          return cart.reduce((sum, item) => {
            const match = findSizeInCatalog(catalog, item.productConfigId)
            const price = match?.price ?? 0

            return sum + price * item.quantity
          }, 0)
        },
        getCartItemView: () => {
          const { cart, catalog } = get()

          return cart.map((item) => {
            const match = findSizeInCatalog(catalog, item.productConfigId)

            return {
              cartItemId: item.cartItemId,
              productConfigId: item.productConfigId,
              displayName: match ? `${match.pizzaName} — ${match.sizeName}` : item.productConfigId,
              price: match?.price ?? 0,
              quantity: item.quantity,
            }
          })
        },
        findCatalogSize: (productConfigId) => {
          return findSizeInCatalog(get().catalog, productConfigId)
        },
        setActiveOrder: (orderData) => {
          const currentOrder = get().activeOrder
          const currentCart = get().cart
          const createdAt = Date.now()
          const total = get().getTotalPrice()

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
