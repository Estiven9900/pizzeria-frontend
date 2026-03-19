import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'

function formatPrice(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function CartDrawer() {
  const isCartOpen = useOrderStore((state) => state.isCartOpen)
  const cart = useOrderStore((state) => state.cart)
  const totalPrice = useOrderStore((state) => state.getTotalPrice())
  const updateQuantity = useOrderStore((state) => state.updateQuantity)
  const removeFromCart = useOrderStore((state) => state.removeFromCart)
  const toggleCart = useOrderStore((state) => state.toggleCart)

  const locale = 'es-ES'
  const currency = 'EUR'

  const isEmpty = cart.length === 0

  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCartOpen])

  const handleContinueToCheckout = () => {
    if (isCartOpen) {
      toggleCart()
    }

    window.location.assign('/checkout')
  }

  return (
    <div
      className={`fixed inset-0 z-40 transition ${
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
        aria-label="Tu Pedido"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Tu Pedido</h2>
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
              {cart.map((item) => (
                <li key={item.cartItemId} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">
                        {item.name} · {item.sizeName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Eliminar ${item.name}`}
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
                        aria-label={`Disminuir cantidad de ${item.name}`}
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
                        aria-label={`Aumentar cantidad de ${item.name}`}
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
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total a pagar</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(totalPrice, locale, currency)}
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={handleContinueToCheckout}
            aria-disabled={isEmpty}
            className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors ${
              isEmpty
                ? 'pointer-events-none bg-red-300'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Finalizar Compra
          </Link>
        </footer>
      </aside>
    </div>
  )
}
