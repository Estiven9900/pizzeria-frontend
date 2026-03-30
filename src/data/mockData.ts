import type { ProductConfig } from '../types'

export const products: ProductConfig[] = [
  { id: 'pepperoni-small', pizzaName: 'Pepperoni', sizeName: 'Small', price: 11.5, canBeOrdered: true },
  { id: 'pepperoni-medium', pizzaName: 'Pepperoni', sizeName: 'Medium', price: 14.5, canBeOrdered: true },
  { id: 'pepperoni-large', pizzaName: 'Pepperoni', sizeName: 'Large', price: 17.5, canBeOrdered: false },

  { id: 'margherita-small', pizzaName: 'Margherita', sizeName: 'Small', price: 10.5, canBeOrdered: true },
  { id: 'margherita-medium', pizzaName: 'Margherita', sizeName: 'Medium', price: 13.5, canBeOrdered: true },
  { id: 'margherita-large', pizzaName: 'Margherita', sizeName: 'Large', price: 16.5, canBeOrdered: true },

  { id: 'hawaiian-small', pizzaName: 'Hawaiian', sizeName: 'Small', price: 12, canBeOrdered: true },
  { id: 'hawaiian-medium', pizzaName: 'Hawaiian', sizeName: 'Medium', price: 15, canBeOrdered: true },
  { id: 'hawaiian-large', pizzaName: 'Hawaiian', sizeName: 'Large', price: 18, canBeOrdered: true },

  { id: 'veggie-small', pizzaName: 'Veggie', sizeName: 'Small', price: 10, canBeOrdered: true },
  { id: 'veggie-medium', pizzaName: 'Veggie', sizeName: 'Medium', price: 13, canBeOrdered: false },
  { id: 'veggie-large', pizzaName: 'Veggie', sizeName: 'Large', price: 16, canBeOrdered: true },
]
