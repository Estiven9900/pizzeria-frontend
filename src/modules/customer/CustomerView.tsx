import { ShoppingCart } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import type { ProductConfig } from '../../types'
import { CartDrawer } from './CartDrawer'
import { PizzaCard } from './PizzaCard'

const fallbackImages: Record<string, string> = {
    Pepperoni:
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  Margherita:
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
  Hawaiian:
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80',
  Veggie:
    'https://images.unsplash.com/photo-1548365328-9f547fb0953e?auto=format&fit=crop&w=1200&q=80',
}

function groupByPizza(products: ProductConfig[]): ProductConfig[][] {
  const map = new Map<string, ProductConfig[]>()
  for (const config of products) {
    const group = map.get(config.pizzaName) ?? []
    group.push(config)
    map.set(config.pizzaName, group)
  }
  return Array.from(map.values())
}

function withFallbackImage(configs: ProductConfig[]): ProductConfig[] {
  if (configs.length === 0) return configs
  if (configs[0].imageUrl) return configs

  const fallback = fallbackImages[configs[0].pizzaName] ?? '/hero.png'
  return configs.map((c) => ({ ...c, imageUrl: fallback }))
}

export function CustomerView() {
  const cart = useOrderStore((state) => state.cart)
  const isCartOpen = useOrderStore((state) => state.isCartOpen)
  const toggleCart = useOrderStore((state) => state.toggleCart)
  const products = useOrderStore((state) => state.products)
  const isLoadingProducts = useOrderStore((state) => state.isLoadingProducts)
  const productsError = useOrderStore((state) => state.productsError)
  const fetchProducts = useOrderStore((state) => state.fetchProducts)

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts()
    }
  }, [products.length, fetchProducts])

  const pizzaGroups = useMemo(() => groupByPizza(products).map(withFallbackImage), [products])

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const handleOpenCart = () => {
    if (!isCartOpen) {
      toggleCart()
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Elige tu pizza</h2>
          <p className="text-sm text-gray-600">Selecciona tamaño y agrégala al carrito</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCart}
          className="relative rounded-full border border-gray-300 bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {totalItems}
          </span>
        </button>
      </header>

      {isLoadingProducts && (
        <p className="py-12 text-center text-gray-500">Cargando catálogo…</p>
      )}

      {productsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700">{productsError}</p>
          <button
            type="button"
            onClick={() => void fetchProducts()}
            className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoadingProducts && !productsError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pizzaGroups.map((configs) => (
            <PizzaCard key={configs[0].pizzaName} configs={configs} />
          ))}
        </div>
      )}

      <CartDrawer />
    </section>
  )
}
