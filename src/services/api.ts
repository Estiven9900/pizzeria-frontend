import axios from 'axios'
import { ENV } from '../config/env'
import type { Pizza, ProductConfig, Size } from '../types'

export interface ProductsResponse {
  pizzas: Pizza[]
  sizes: Size[]
  productConfigs: ProductConfig[]
}

const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchProductsCatalog(): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>('/api/products')
  return data
}

export default api
