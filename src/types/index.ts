export interface Pizza {
  id: string
  name: string
}

export interface Size {
  id: string
  name: 'Small' | 'Medium' | 'Large'
}

export interface ProductConfig {
  pizzaId: Pizza['id']
  sizeId: Size['id']
  price: number
}
