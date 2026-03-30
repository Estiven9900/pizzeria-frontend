import { useEffect, useState } from 'react'
import type { ProductConfig } from '../../types'
import { useOrderStore } from '../../store/useOrderStore'
import { formatPrice } from '../../utils/formatPrice'

interface PizzaCardProps {
  configs: ProductConfig[]
  locale?: string
  currency?: string
}

export function PizzaCard({
  configs,
  locale = 'es-ES',
  currency = 'EUR',
}: PizzaCardProps) {
  const addToCart = useOrderStore((state) => state.addToCart)

  const pizzaName = configs[0].pizzaName
  const imageUrl = configs[0].imageUrl

  const [selectedConfigId, setSelectedConfigId] = useState(configs[0].id)
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [isLocking, setIsLocking] = useState(false)

  const selectedConfig = configs.find((c) => c.id === selectedConfigId) ?? configs[0]

  useEffect(() => {
    if (!showAddedToast) {
      return
    }

    const timeoutId = setTimeout(() => {
      setShowAddedToast(false)
    }, 1200)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [showAddedToast])

  const handleOrder = async () => {
    if (!selectedConfig.canBeOrdered || isLocking) {
      return
    }

    setIsLocking(true)

    await addToCart({
      cartItemId: crypto.randomUUID(),
      productConfigId: selectedConfig.id,
      displayName: `${selectedConfig.pizzaName} - ${selectedConfig.sizeName}`,
      price: selectedConfig.price,
      quantity: 1,
      lockedAt: Date.now(),
    })

    setIsLocking(false)
    setShowAddedToast(true)
  }

  return (
    <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl ?? '/hero.png'}
          alt={pizzaName}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-gray-900">{pizzaName}</h3>
          <p className="text-lg font-bold text-red-600">
            {formatPrice(selectedConfig.price, locale, currency)}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-600">Tamaño</legend>
          <div className="flex flex-wrap gap-2">
            {configs.map((config) => {
              const isSelected = config.id === selectedConfig.id

              return (
                <button
                  key={config.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!config.canBeOrdered}
                  onClick={() => setSelectedConfigId(config.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    !config.canBeOrdered
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : isSelected
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {config.canBeOrdered ? config.sizeName : 'Agotado'}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="relative">
          <button
            type="button"
            onClick={() => void handleOrder()}
            disabled={!selectedConfig.canBeOrdered || isLocking}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLocking ? 'Reservando…' : !selectedConfig.canBeOrdered ? 'Agotado' : 'Agregar al Carrito'}
          </button>

          <p
            className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 transition-all duration-300 ${
              showAddedToast ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            aria-hidden={!showAddedToast}
          >
            Agregado al carrito
          </p>
        </div>
      </div>
    </article>
  )
}
