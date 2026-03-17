export type UUID = string

export type OrderStatus = 'Selection' | 'Pending' | 'Ready'

export interface PizzaClickOrder {
  id: UUID
  customer_name: string
  customer_email: string
  status: OrderStatus
  total: number
  created_at: Date
}

export interface Sizes {
  id: UUID
  name: string
  price: number
}

export interface Pizza {
  id: UUID
  name: string
  sizes: Sizes[]
}
