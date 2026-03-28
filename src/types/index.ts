export interface Pizza {
  id: string
  name: string
  imageUrl?: string
}

export interface Size {
  id: string
  name: string
}

export interface ProductConfig {
  id: string
  pizzaId: Pizza['id']
  sizeId: Size['id']
  price: number
}
