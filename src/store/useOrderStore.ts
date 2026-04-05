import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { fetchCatalog, lockProduct } from '../services/productService'
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

const SESSION_ID_KEY = 'pizzaclick-session-id'

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_ID_KEY, sessionId)
  }

  return sessionId
}

interface OrderStore {
  catalog: CatalogPizza[]
  availableProducts: AvailableProduct[]
  isLoading: boolean
  catalogError: string | null
  cart: CartItem[]
  isCartOpen: boolean
  hasHydrated: boolean
  activeOrder: ActiveOrder | null
  timeRemaining: number
  isLocked: boolean
  loadCatalog: () => Promise<void>
  initCatalog: () => Promise<void>
  addToCart: (productConfigId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, delta: number) => void
  toggleCart: () => void
  setHasHydrated: (value: boolean) => void
  clearCart: () => void
  getTotalPrice: () => number
  getCartItemView: () => CartItemView[]
  hasExpiredItems: () => boolean
  canCheckout: () => boolean
  markItemExpired: (cartItemId: string) => void
  checkLockExpirations: () => void
  findCatalogSize: (productConfigId: string) => (CatalogSize & { pizzaName: string }) | undefined
  setActiveOrder: (orderData?: SetActiveOrderInput) => void
  setOrderStatus: (status: OrderStatus) => void
  clearActiveOrder: () => void
  refreshOrderLock: () => void
}

export interface CartItem {
  cartItemId: string
  productConfigId: string
  name: string
  price: number
  quantity: number
  expiresAt: string
  lockedUntil: number
  expired: boolean
}

export interface AvailableProduct {
  productConfigId: string
  name: string
  price: number
  isAvailable: boolean
  selectable: boolean
}

export interface CartItemView {
  cartItemId: string
  productConfigId: string
  displayName: string
  price: number
  quantity: number
  lockedUntil: number
  expired: boolean
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

function mapAvailableProducts(catalog: CatalogPizza[]): AvailableProduct[] {
  return catalog.flatMap((pizza) =>
    pizza.sizes.map((size) => ({
      productConfigId: size.product_config_id,
      name: `${pizza.pizzaName} — ${size.name}`,
      price: size.price,
      isAvailable: size.is_available,
      selectable: size.is_available,
    })),
  )
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
        availableProducts: [],
        isLoading: false,
        catalogError: null,
        cart: [],
        isCartOpen: false,
        hasHydrated: false,
        activeOrder: null,
        timeRemaining: ORDER_LOCK_TIME_SECONDS,
        isLocked: false,
        // RF-01: sincroniza catálogo y derivados de disponibilidad.
        loadCatalog: async () => {
          set({ isLoading: true, catalogError: null })
          try {
            const data = await fetchCatalog()
            const availableProducts = mapAvailableProducts(data.pizzas)
            set({ catalog: data.pizzas, availableProducts, isLoading: false })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al cargar el catálogo'
            set({ catalogError: message, isLoading: false })
          }
        },
        initCatalog: async () => {
          await get().loadCatalog()
        },
        // RF-02: Bloquea configs no disponibles, hace lock en servidor,
        // y guarda solo product_config_id, name y price en el carrito.
        addToCart: async (productConfigId, quantity) => {
          const selectedProduct = get().availableProducts.find(
            (product) => product.productConfigId === productConfigId,
          )
          if (!selectedProduct || !selectedProduct.selectable) return

          const { name, price } = selectedProduct

          const sessionId = getSessionId()
          const { expires_at } = await lockProduct(productConfigId, sessionId)
          const lockedUntil = new Date(expires_at).getTime()

          set((state) => {
            const existingItem = state.cart.find(
              (cartItem) => cartItem.productConfigId === productConfigId,
            )

            if (!existingItem) {
              return {
                cart: [...state.cart, {
                  cartItemId: crypto.randomUUID(),
                  productConfigId,
                  name,
                  price,
                  quantity,
                  expiresAt: expires_at,
                  lockedUntil,
                  expired: false,
                }],
              }
            }

            return {
              cart: state.cart.map((cartItem) =>
                cartItem.productConfigId === productConfigId
                  ? {
                    ...cartItem,
                    quantity: cartItem.quantity + quantity,
                    name,
                    price,
                    expiresAt: expires_at,
                    lockedUntil,
                    expired: false,
                  }
                  : cartItem,
              ),
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
          const { cart } = get()

          return cart.reduce((sum, item) => {
            return sum + (item.price ?? 0) * item.quantity
          }, 0)
        },
        getCartItemView: () => {
          const { cart } = get()

          return cart.map((item) => ({
            cartItemId: item.cartItemId,
            productConfigId: item.productConfigId,
            displayName: item.name || item.productConfigId,
            price: item.price ?? 0,
            quantity: item.quantity,
            lockedUntil: item.lockedUntil,
            expired: item.expired,
          }))
        },
        hasExpiredItems: () => {
          const now = Date.now()
          return get().cart.some(
            (item) => item.expired || now > new Date(item.expiresAt).getTime(),
          )
        },
        canCheckout: () => {
          const { cart } = get()
          const now = Date.now()
          return (
            cart.length > 0
            && cart.every(
              (item) => !item.expired && now <= new Date(item.expiresAt).getTime(),
            )
          )
        },
        markItemExpired: (cartItemId) => {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.cartItemId === cartItemId ? { ...item, expired: true } : item,
            ),
          }))
        },
        checkLockExpirations: () => {
          const now = Date.now()
          set((state) => ({
            cart: state.cart.map((item) =>
              !item.expired
              && item.expiresAt
              && Number.isFinite(new Date(item.expiresAt).getTime())
              && now > new Date(item.expiresAt).getTime()
                ? { ...item, expired: true }
                : item,
            ),
          }))
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
