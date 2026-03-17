import type { Pizza, ProductConfig, Size } from '../types'

export const pizzas: Pizza[] = [
  { id: 'pepperoni', name: 'Pepperoni' },
  { id: 'margherita', name: 'Margherita' },
  { id: 'hawaiian', name: 'Hawaiian' },
  { id: 'veggie', name: 'Veggie' },
]

export const sizes: Size[] = [
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' },
]

export const productConfigs: ProductConfig[] = [
  { pizzaId: 'pepperoni', sizeId: 'small', price: 11.5 },
  { pizzaId: 'pepperoni', sizeId: 'medium', price: 14.5 },
  { pizzaId: 'pepperoni', sizeId: 'large', price: 17.5 },

  { pizzaId: 'margherita', sizeId: 'small', price: 10.5 },
  { pizzaId: 'margherita', sizeId: 'medium', price: 13.5 },
  { pizzaId: 'margherita', sizeId: 'large', price: 16.5 },

  { pizzaId: 'hawaiian', sizeId: 'small', price: 12 },
  { pizzaId: 'hawaiian', sizeId: 'medium', price: 15 },
  { pizzaId: 'hawaiian', sizeId: 'large', price: 18 },

  { pizzaId: 'veggie', sizeId: 'small', price: 10 },
  { pizzaId: 'veggie', sizeId: 'medium', price: 13 },
  { pizzaId: 'veggie', sizeId: 'large', price: 16 },
]
