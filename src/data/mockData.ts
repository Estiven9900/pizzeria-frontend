import type { ProductConfig } from '../types'

export const products: ProductConfig[] = [
  { id: 'pepperoni-small', pizzaId: 'pepperoni', pizzaName: 'Pepperoni', sizeName: 'Small', price: 11.5, isAvailable: true },
  { id: 'pepperoni-medium', pizzaId: 'pepperoni', pizzaName: 'Pepperoni', sizeName: 'Medium', price: 14.5, isAvailable: true },
  { id: 'pepperoni-large', pizzaId: 'pepperoni', pizzaName: 'Pepperoni', sizeName: 'Large', price: 17.5, isAvailable: false },

  { id: 'margherita-small', pizzaId: 'margherita', pizzaName: 'Margherita', sizeName: 'Small', price: 10.5, isAvailable: true },
  { id: 'margherita-medium', pizzaId: 'margherita', pizzaName: 'Margherita', sizeName: 'Medium', price: 13.5, isAvailable: true },
  { id: 'margherita-large', pizzaId: 'margherita', pizzaName: 'Margherita', sizeName: 'Large', price: 16.5, isAvailable: true },

  { id: 'hawaiian-small', pizzaId: 'hawaiian', pizzaName: 'Hawaiian', sizeName: 'Small', price: 12, isAvailable: true },
  { id: 'hawaiian-medium', pizzaId: 'hawaiian', pizzaName: 'Hawaiian', sizeName: 'Medium', price: 15, isAvailable: true },
  { id: 'hawaiian-large', pizzaId: 'hawaiian', pizzaName: 'Hawaiian', sizeName: 'Large', price: 18, isAvailable: true },

  { id: 'veggie-small', pizzaId: 'veggie', pizzaName: 'Veggie', sizeName: 'Small', price: 10, isAvailable: true },
  { id: 'veggie-medium', pizzaId: 'veggie', pizzaName: 'Veggie', sizeName: 'Medium', price: 13, isAvailable: false },
  { id: 'veggie-large', pizzaId: 'veggie', pizzaName: 'Veggie', sizeName: 'Large', price: 16, isAvailable: true },
]
