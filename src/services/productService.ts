import axios from 'axios'
import { ENV } from '../config/env'

export interface CatalogSize {
  product_config_id: string
  sizeName: string
  price: number
  sku: string
  is_available: boolean
}

export interface CatalogPizza {
  pizzaName: string
  imageUrl?: string
  sizes: CatalogSize[]
}

export interface CatalogResponse {
  pizzas: CatalogPizza[]
}

const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchCatalog(): Promise<CatalogResponse> {
  try {
    const { data } = await api.get<CatalogResponse>('/api/products')
    return data
  } catch (error) {
    console.error('[productService] Error al obtener el catálogo:', error)
    throw error
  }
}
