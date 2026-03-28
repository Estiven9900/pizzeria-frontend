import axios from 'axios'
import { ENV } from '../config/env'
import type { ProductConfig } from '../types'

export interface ProductsResponse {
  products: ProductConfig[]
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

export interface LockProductResponse {
  locked: boolean
  lockedAt: string
}

export async function lockProduct(configId: string): Promise<LockProductResponse> {
  const { data } = await api.post<LockProductResponse>(`/api/products/${configId}/lock`)
  return data
}

export default api
