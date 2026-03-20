import { useState } from 'react'
import { useOrderStore } from '../../store/useOrderStore'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function DebugCart() {
  const cart = useOrderStore((state) => state.cart)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (productConfigId: string) => {
    try {
      await navigator.clipboard.writeText(productConfigId)
      setCopiedId(productConfigId)

      setTimeout(() => {
        setCopiedId((current) => (current === productConfigId ? null : current))
      }, 1200)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">Debug Cart</h3>

      {cart.length === 0 ? (
        <p className="text-sm text-gray-500">No hay productos en el cart.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="px-3 py-2 font-medium">productConfigId</th>
                <th className="px-3 py-2 font-medium">name</th>
                <th className="px-3 py-2 font-medium">price</th>
                <th className="px-3 py-2 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.cartItemId} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs text-gray-700">{item.productConfigId}</td>
                  <td className="px-3 py-2 text-gray-800">{item.name}</td>
                  <td className="px-3 py-2 text-gray-800">{formatPrice(item.price)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.productConfigId)}
                      className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      {copiedId === item.productConfigId ? 'Copiado' : 'Copiar ID'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
