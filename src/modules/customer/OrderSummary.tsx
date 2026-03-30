import { useOrderStore } from '../../store/useOrderStore'
import { formatPrice } from '../../utils/formatPrice'

interface OrderSummaryProps {
  customerName?: string
  orderId?: string
  locale?: string
  currency?: string
}

export function OrderSummary({
  customerName = 'Cliente',
  orderId,
  locale = 'es-ES',
  currency = 'EUR',
}: OrderSummaryProps) {
  const cartItemViews = useOrderStore((state) => state.getCartItemView())
  const totalPrice = useOrderStore((state) => state.getTotalPrice())
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)

  const handleConfirmOrder = () => {
    setActiveOrder({
      id: orderId ?? crypto.randomUUID(),
      customer_name: customerName,
      status: 'Pending',
    })
  }

  return (
    <section className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Resumen del pedido</h3>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {cartItemViews.map((item) => (
          <li key={item.cartItemId} className="flex items-center justify-between">
            <span className="text-gray-800">
              {item.displayName} x{item.quantity}
            </span>
            <span className="font-medium text-gray-900">
              {formatPrice(item.price * item.quantity, locale, currency)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-base">
        <span className="font-semibold text-gray-900">Total:</span>{' '}
        <span className="font-bold text-red-600">{formatPrice(totalPrice, locale, currency)}</span>
      </p>

      <button
        type="button"
        onClick={handleConfirmOrder}
        className="mt-5 w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        Confirmar Pedido (Simular Pago)
      </button>
    </section>
  )
}
