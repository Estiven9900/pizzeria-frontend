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
  { id: 'pepperoni-small', pizzaId: 'pepperoni', sizeId: 'small', price: 11.5, is_available: true },
  { id: 'pepperoni-medium', pizzaId: 'pepperoni', sizeId: 'medium', price: 14.5, is_available: true },
  { id: 'pepperoni-large', pizzaId: 'pepperoni', sizeId: 'large', price: 17.5, is_available: false },

  { id: 'margherita-small', pizzaId: 'margherita', sizeId: 'small', price: 10.5, is_available: true },
  { id: 'margherita-medium', pizzaId: 'margherita', sizeId: 'medium', price: 13.5, is_available: true },
  { id: 'margherita-large', pizzaId: 'margherita', sizeId: 'large', price: 16.5, is_available: true },

  { id: 'hawaiian-small', pizzaId: 'hawaiian', sizeId: 'small', price: 12, is_available: true },
  { id: 'hawaiian-medium', pizzaId: 'hawaiian', sizeId: 'medium', price: 15, is_available: true },
  { id: 'hawaiian-large', pizzaId: 'hawaiian', sizeId: 'large', price: 18, is_available: true },

  { id: 'veggie-small', pizzaId: 'veggie', sizeId: 'small', price: 10, is_available: true },
  { id: 'veggie-medium', pizzaId: 'veggie', sizeId: 'medium', price: 13, is_available: false },
  { id: 'veggie-large', pizzaId: 'veggie', sizeId: 'large', price: 16, is_available: true },
]
