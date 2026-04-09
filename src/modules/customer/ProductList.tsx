import type { CatalogPizza } from '../../services/productService'
import { EmptyState } from '../../components/EmptyState'
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
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products && products.length > 0
        ? products.map((pizza) => {
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
          })
        : !isLoading && <EmptyState />}
    </div>
  )
}
