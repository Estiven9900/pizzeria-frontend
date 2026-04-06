import type { CatalogPizza } from '../../services/productService'
import { PizzaCard } from './PizzaCard'

interface ProductListProps {
  products: CatalogPizza[]
  isLoading: boolean
  locale?: string
  currency?: string
}

export function ProductList({
  products,
  isLoading,
  locale,
  currency,
}: ProductListProps) {
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="text-5xl" aria-hidden="true">🍕</span>
        <p className="text-base font-medium text-gray-600">
          Estamos preparando el horno, vuelve en un momento
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((pizza) => {
        // Defensa: ignorar pizzas que lleguen sin sizes del backend
        if (!pizza.sizes?.length) return null

        return (
          <PizzaCard
            key={pizza.pizzaName}
            pizza={pizza}
            locale={locale}
            currency={currency}
          />
        )
      })}
    </div>
  )
}
