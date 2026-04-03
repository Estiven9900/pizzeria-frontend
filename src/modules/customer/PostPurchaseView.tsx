import { CheckCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { OrderTimer } from '../../components/OrderTimer'
import { useOrderStore } from '../../store/useOrderStore'
import { formatPrice } from '../../utils/formatPrice'

interface GoogleMapsAddress {
  address: string
  lat: number
  lng: number
}

interface PostPurchaseViewProps {
  deliveryLocation: GoogleMapsAddress
  locale?: string
  currency?: string
  onEditOrder?: () => void
}

function getTimestamp(value: Date | string | number | undefined): number {
  if (typeof value === 'number') {
    return value
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    return new Date(value).getTime()
  }

  return Date.now()
}

export function PostPurchaseView({
  deliveryLocation,
  locale = 'es-ES',
  currency = 'EUR',
  onEditOrder,
}: PostPurchaseViewProps) {
  const activeOrder = useOrderStore((state) => state.activeOrder)
  const setOrderStatus = useOrderStore((state) => state.setOrderStatus)
  const isLocked = useOrderStore((state) => state.isLocked)
  const totalPrice = useOrderStore((state) => state.getTotalPrice())

  const cartItems = activeOrder?.cart ?? []

  const cartItemViews = useMemo(() => {
    return cartItems.map((item) => ({
      cartItemId: item.cartItemId,
      displayName: item.name || item.productConfigId,
      price: item.price ?? 0,
      quantity: item.quantity,
    }))
  }, [cartItems])

  const [orderCode] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [couponCode, setCouponCode] = useState<string | null>(null)

  const createdAt = useMemo(() => {
    return getTimestamp(activeOrder?.created_at)
  }, [activeOrder?.created_at])

  const orderStatusLabel = activeOrder?.status ?? 'Pending'

  const handleCancel = () => {
    if (isLocked || !activeOrder) {
      return
    }

    const generatedCoupon = `PIZZA-REFUND-${Math.floor(1000 + Math.random() * 9000)}`
    setCouponCode(generatedCoupon)

    setOrderStatus('CANCELADO')
  }

  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <header className="border-b border-dashed border-gray-300 pb-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-6 w-6 text-green-600" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                ¡Recibimos tu pedido!. Orden #{orderCode} confirmada
              </h2>
              <p className="mt-1 text-sm text-gray-600">Estado actual: {orderStatusLabel}</p>
            </div>
          </div>
        </header>

        <div className="mt-6 flex justify-center">
          <OrderTimer createdAt={createdAt} onCancel={handleCancel} />
        </div>

        <div className="mt-4 h-10">
          <div
            className={`flex items-center justify-center gap-3 transition-opacity duration-300 ${
              isLocked ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={onEditOrder}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Editar Pedido
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Cancelar Orden
            </button>
          </div>
        </div>

        {couponCode && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">Cupón Generado</p>
            <p className="mt-1 text-lg font-bold tracking-wide text-green-900">{couponCode}</p>
            <p className="mt-1 text-sm text-green-800">
              Monto a favor: {formatPrice(totalPrice, locale, currency)}
            </p>
            <p className="mt-1 text-xs text-green-700">
              Enviamos este código a tu email para tu próxima compra.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-5 border-t border-dashed border-gray-300 pt-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Dirección de entrega
            </h3>
            <p className="mt-2 text-sm text-gray-800">{deliveryLocation.address}</p>
            <p className="text-xs text-gray-500">
              Lat: {deliveryLocation.lat} | Lng: {deliveryLocation.lng}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Productos del carrito
            </h3>
            <ul className="mt-2 space-y-2">
              {cartItemViews.map((item) => (
                <li
                  key={item.cartItemId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                >
                  <p className="text-gray-800">
                    {item.displayName} x{item.quantity}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity, locale, currency)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
