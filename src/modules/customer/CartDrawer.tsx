import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'
import type { CartItemView } from '../../store/useOrderStore' 
import { formatPrice } from '../../utils/formatPrice'
import { formatMmSs } from '../../utils/orderHelpers'

function ItemCountdown({ item }: { item: CartItemView }) {
  const markItemExpired = useOrderStore((state) => state.markItemExpired)
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, item.lockedUntil - Date.now()),
  )

  useEffect(() => {
    if (item.expired) return

    const ms = Math.max(0, item.lockedUntil - Date.now())
    setRemainingMs(ms)

    if (ms === 0) {
      markItemExpired(item.cartItemId)
      return
    }

    const intervalId = setInterval(() => {
      const next = Math.max(0, item.lockedUntil - Date.now())
      setRemainingMs(next)

      if (next === 0) {
        clearInterval(intervalId)
        markItemExpired(item.cartItemId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [item.lockedUntil, item.expired, item.cartItemId, markItemExpired])

  if (item.expired || remainingMs <= 0) {
    return (
      <p className="mt-1 text-xs font-medium text-red-600">
        Stock liberado, vuelve a agregar para reservar
      </p>
    )
  }

  const isExpiring = remainingMs < 2 * 60 * 1000

  return (
    <p className={`mt-1 text-xs ${isExpiring ? 'font-medium text-red-500' : 'text-gray-400'}`}>
      Reserva: {formatMmSs(remainingMs)}
    </p>
  )
}

export function CartDrawer() {
  const isCartOpen = useOrderStore((state) => state.isCartOpen)
  const cart = useOrderStore((state) => state.cart)
  const cartItemViews = useMemo(
    () =>
      cart.map((item) => ({
        cartItemId: item.cartItemId,
        productConfigId: item.productConfigId,
        displayName: item.name || item.productConfigId,
        price: item.price ?? 0,
        quantity: item.quantity,
        lockedUntil: item.lockedUntil,
        expired: item.expired,
      })),
    [cart],
  )
  const totalPrice = useOrderStore((state) => state.getTotalPrice())
  const canCheckout = useOrderStore((state) => state.canCheckout())
  const hasExpired = useOrderStore((state) => state.hasExpiredItems())
  const updateQuantity = useOrderStore((state) => state.updateQuantity)
  const removeFromCart = useOrderStore((state) => state.removeFromCart)
  const toggleCart = useOrderStore((state) => state.toggleCart)
  const checkLockExpirations = useOrderStore((state) => state.checkLockExpirations)

  const locale = 'es-ES'
  const currency = 'EUR'

  const isEmpty = cartItemViews.length === 0

  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    checkLockExpirations()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCartOpen, checkLockExpirations])

  const handleContinueToCheckout = () => {
    if (isCartOpen) {
      toggleCart()
    }

    window.location.assign('/checkout')
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isCartOpen}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={toggleCart}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mi Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Mi Carrito</h2>
          <button
            type="button"
            onClick={toggleCart}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-14 w-14 text-gray-300" aria-hidden="true" />
              <p className="text-sm text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItemViews.map((item) => (
                <li
                  key={item.cartItemId}
                  className={`rounded-lg border p-3 transition-colors ${
                    item.expired
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">
                        {item.displayName}
                      </p>
                      <ItemCountdown item={item} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Eliminar ${item.displayName}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price, locale, currency)}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                        aria-label={`Disminuir cantidad de ${item.displayName}`}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                        aria-label={`Aumentar cantidad de ${item.displayName}`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="mt-auto border-t border-gray-200 bg-white px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-base font-semibold text-gray-900">
              {formatPrice(totalPrice, locale, currency)}
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(totalPrice, locale, currency)}
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={handleContinueToCheckout}
            aria-disabled={!canCheckout}
            className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors ${
              !canCheckout
                ? 'pointer-events-none bg-red-300'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Finalizar Compra
          </Link>
          {hasExpired && (
            <p className="mt-2 text-center text-xs text-red-600">
              Reserva expirada. Elimina o actualiza los ítems expirados para continuar
            </p>
          )}
        </footer>
      </aside>
    </div>
  )
}
