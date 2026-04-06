import { ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import type { CatalogPizza } from '../../services/productService'
import { CartDrawer } from './CartDrawer'
import { ProductList } from './ProductList'

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

function withFallbackImage(pizza: CatalogPizza): CatalogPizza {
  if (pizza.imageUrl) return pizza
  const fallback = fallbackImages[pizza.pizzaName] ?? '/hero.png'
  return { ...pizza, imageUrl: fallback }
}

export function CustomerView() {
  const cart = useOrderStore((state) => state.cart)
  const isCartOpen = useOrderStore((state) => state.isCartOpen)
  const toggleCart = useOrderStore((state) => state.toggleCart)
  const catalog = useOrderStore((state) => state.catalog)
  const isLoading = useOrderStore((state) => state.isLoading)
  const catalogError = useOrderStore((state) => state.catalogError)
  const initCatalog = useOrderStore((state) => state.initCatalog)

  const pizzas = useMemo(() => catalog.map(withFallbackImage), [catalog])

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

      {isLoading && (
        <p className="py-12 text-center text-gray-500">Cargando catálogo…</p>
      )}

      {catalogError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700">{catalogError}</p>
          <button
            type="button"
            onClick={() => void initCatalog()}
            className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !catalogError && (
        <ProductList products={pizzas} isLoading={isLoading} />
      )}

      <CartDrawer />
    </section>
  )
}
