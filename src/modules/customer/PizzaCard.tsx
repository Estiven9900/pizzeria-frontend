import { useEffect, useMemo, useState } from 'react'
import type { Pizza, ProductConfig, Size } from '../../types'
import { useOrderStore } from '../../store/useOrderStore'
import { formatPrice } from '../../utils/formatPrice'

interface OrderSelection {
  productConfigId: string
  pizza: Pizza
  size: Size
  total: number
}

interface PizzaCardProps {
  pizza: Pizza
  sizes: Size[]
  productConfigs: ProductConfig[]
  imageUrl: string
  defaultSizeId?: Size['id']
  onOrder?: (selection: OrderSelection) => void
  locale?: string
  currency?: string
}

export function PizzaCard({
  pizza,
  sizes,
  productConfigs,
  imageUrl,
  defaultSizeId,
  onOrder,
  locale = 'es-ES',
  currency = 'EUR',
}: PizzaCardProps) {
  const addToCart = useOrderStore((state) => state.addToCart)
  const pizzaConfigs = useMemo(() => {
    return productConfigs.filter((config) => config.pizzaId === pizza.id)
  }, [pizza.id, productConfigs])

  const availableSizes = useMemo(() => {
    return sizes.filter((size) =>
      pizzaConfigs.some((config) => config.sizeId === size.id),
    )
  }, [pizzaConfigs, sizes])

  const initialSizeId = useMemo(() => {
    if (availableSizes.length === 0) {
      return null
    }

    return (
      availableSizes.find((size) => size.id === defaultSizeId)?.id ??
      availableSizes[0].id
    )
  }, [availableSizes, defaultSizeId])

  const [selectedSizeId, setSelectedSizeId] = useState(initialSizeId ?? '')
  const [showAddedToast, setShowAddedToast] = useState(false)

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

  const selectedConfig = useMemo(() => {
    return (
      pizzaConfigs.find((config) => config.sizeId === selectedSizeId) ??
      (initialSizeId
        ? pizzaConfigs.find((config) => config.sizeId === initialSizeId)
        : undefined)
    )
  }, [initialSizeId, pizzaConfigs, selectedSizeId])

  const selectedSize = useMemo(() => {
    return (
      availableSizes.find((size) => size.id === selectedSizeId) ??
      (initialSizeId
        ? availableSizes.find((size) => size.id === initialSizeId)
        : undefined)
    )
  }, [availableSizes, initialSizeId, selectedSizeId])

  const displayedPrice = selectedConfig?.price ?? 0

  const handleSizeChange = (size: Size) => {
    setSelectedSizeId(size.id)
  }

  const handleOrder = () => {
    if (!selectedSize || !selectedConfig) {
      return
    }

    addToCart({
      cartItemId: crypto.randomUUID(),
      productConfigId: selectedConfig.id,
      name: pizza.name,
      sizeName: selectedSize.name,
      price: selectedConfig.price,
      quantity: 1,
    })

    setShowAddedToast(true)

    onOrder?.({
      productConfigId: selectedConfig.id,
      pizza,
      size: selectedSize,
      total: selectedConfig.price,
    })
  }

  return (
    <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={pizza.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-gray-900">{pizza.name}</h3>
          <p className="text-lg font-bold text-red-600">
            {formatPrice(displayedPrice, locale, currency)}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-600">Tamaño</legend>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = size.id === selectedSize?.id

              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSizeChange(size)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size.name}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="relative">
          <button
            type="button"
            onClick={handleOrder}
            disabled={!selectedConfig || !selectedSize}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar al Carrito
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
