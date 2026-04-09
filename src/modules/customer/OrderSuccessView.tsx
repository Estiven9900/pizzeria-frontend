import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../../store/useOrderStore'

export function OrderSuccessView() {
  const navigate = useNavigate()
  const activeOrder = useOrderStore((state) => state.activeOrder)

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-gray-900">¡Pedido confirmado!</h2>

        {activeOrder && (
          <p className="mt-2 text-sm text-gray-600">
            Gracias, <span className="font-medium">{activeOrder.customer_name}</span>. Recibirás
            tu pizza en: <span className="font-medium">{activeOrder.delivery_address}</span>.
          </p>
        )}

        <p className="mt-4 text-xs text-gray-500">
          Te enviaremos un email con los detalles de tu orden.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-700"
        >
          Volver al menú
        </button>
      </div>
    </section>
  )
}
