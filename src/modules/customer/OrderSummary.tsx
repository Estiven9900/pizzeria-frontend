import { useOrderStore } from '../../store/useOrderStore'

interface OrderSummaryProps {
  pizzaName: string
  sizeName: string
  total: number
  customerName?: string
  orderId?: string
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

export function OrderSummary({
  pizzaName,
  sizeName,
  total,
  customerName = 'Cliente',
  orderId,
  locale = 'es-ES',
  currency = 'EUR',
}: OrderSummaryProps) {
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)

  const handleConfirmOrder = () => {
    setActiveOrder({
      id: orderId ?? crypto.randomUUID(),
      customer_name: customerName,
      status: 'Pending',
      created_at: new Date(),
    })
  }

  return (
    <section className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Resumen del pedido</h3>

      <div className="mt-4 space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-900">Pizza:</span> {pizzaName}
        </p>
        <p>
          <span className="font-medium text-gray-900">Tamaño:</span> {sizeName}
        </p>
        <p className="text-base">
          <span className="font-semibold text-gray-900">Total:</span>{' '}
          <span className="font-bold text-red-600">{formatPrice(total, locale, currency)}</span>
        </p>
      </div>

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
