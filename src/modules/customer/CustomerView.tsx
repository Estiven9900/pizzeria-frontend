import { ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { pizzas, productConfigs, sizes } from '../../data/mockData'
import { useOrderStore } from '../../store/useOrderStore'
import { CartDrawer } from './CartDrawer'
import { DebugCart } from './DebugCart'
import { PizzaCard } from './PizzaCard'

const pizzaImages: Record<string, string> = {
  pepperoni:
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  margherita:
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
  hawaiian:
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80',
  veggie:
    'https://images.unsplash.com/photo-1548365328-9f547fb0953e?auto=format&fit=crop&w=1200&q=80',
}

export function CustomerView() {
  const cart = useOrderStore((state) => state.cart)
  const isCartOpen = useOrderStore((state) => state.isCartOpen)
  const toggleCart = useOrderStore((state) => state.toggleCart)

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pizzas.map((pizza) => (
          <PizzaCard
            key={pizza.id}
            pizza={pizza}
            sizes={sizes}
            productConfigs={productConfigs}
            imageUrl={pizzaImages[pizza.id] ?? '/hero.png'}
          />
        ))}
      </div>

      <DebugCart />

      <CartDrawer />
    </section>
  )
}
