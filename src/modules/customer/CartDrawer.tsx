import { ShoppingCart, Trash2, X } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  onGoToCheckout: () => void
  locale?: string
  currency?: string
}

function formatPrice(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function CartDrawer({
  isOpen,
  onClose,
  onGoToCheckout,
  locale = 'es-ES',
  currency = 'EUR',
}: CartDrawerProps) {
  const cartItems = useOrderStore((state) => state.cart)
  const totalCartPrice = useOrderStore((state) => state.totalPrice)
  const updateQuantity = useOrderStore((state) => state.updateQuantity)
  const removeFromCart = useOrderStore((state) => state.removeFromCart)

  const isEmpty = cartItems.length === 0

  const handleContinueToCheckout = () => {
    onClose()
    onGoToCheckout()
  }

  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Tu carrito</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300" aria-hidden="true" />
              <p className="text-sm text-gray-500">¡Tu carrito está vacío! Empieza a agregar pizzas</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.pizzaName}</p>
                      <p className="text-sm text-gray-500">{item.sizeName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Eliminar ${item.pizzaName}`}
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
                        className="h-7 w-7 rounded-md border border-gray-300 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                        aria-label={`Disminuir cantidad de ${item.pizzaName}`}
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="h-7 w-7 rounded-md border border-gray-300 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                        aria-label={`Aumentar cantidad de ${item.pizzaName}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(totalCartPrice, locale, currency)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleContinueToCheckout}
            disabled={isEmpty}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            Continuar al Pago
          </button>
        </footer>
      </aside>
    </div>
  )
}
