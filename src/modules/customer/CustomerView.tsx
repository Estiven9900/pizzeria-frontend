import { pizzas, productConfigs, sizes } from '../../data/mockData'
import { useOrderStore } from '../../store/useOrderStore'
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
  const addToCart = useOrderStore((state) => state.addToCart)
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)

  const handleOrder = (
    pizzaId: string,
    pizzaName: string,
    sizeId: string,
    sizeName: string,
    price: number,
  ) => {
    addToCart({
      pizzaId,
      name: pizzaName,
      sizeId,
      sizeName,
      price,
      quantity: 1,
    })

    setActiveOrder({
      customer_name: 'Cliente',
      status: 'Pending',
    })

    console.info(`Pedido confirmado para ${pizzaName}`)
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Elige tu pizza</h2>
        <p className="text-sm text-gray-600">Selecciona tamaño y pulsa Pedir</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pizzas.map((pizza) => (
          <PizzaCard
            key={pizza.id}
            pizza={pizza}
            sizes={sizes}
            productConfigs={productConfigs}
            imageUrl={pizzaImages[pizza.id] ?? '/hero.png'}
            onOrder={({ pizza: selectedPizza, size, total }) =>
              handleOrder(
                selectedPizza.id,
                selectedPizza.name,
                size.id,
                size.name,
                total,
              )
            }
          />
        ))}
      </div>
    </section>
  )
}
