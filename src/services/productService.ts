import axios from 'axios'
import { ENV } from '../config/env'

// ─── Interfaces (Dictionary-based, matches backend schema) ───────────────────

export interface Pizza {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sizes: ProductConfig[]
}

export interface ProductConfig {
  id: string
  pizza_id: string
  size_id: string
  price: number
  sku: string
  is_available: boolean
}

// ─── Backend raw response types ───────────────────────────────────────────────

interface BackendSizeOption {
  product_config_id: string
  size: string
  price: number
  sku: string | null
  is_available: boolean
}

interface BackendPizza {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sizes: BackendSizeOption[]
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Service functions ────────────────────────────────────────────────────────

export async function fetchCatalog(): Promise<Pizza[]> {
  const { data } = await api.get<BackendPizza[]>('/api/products')
  return data
    .filter((item) => item.sizes.length > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      sizes: item.sizes.map((size) => ({
        id: size.product_config_id,
        pizza_id: item.id,
        size_id: size.size,
        price: size.price,
        sku: size.sku ?? '',
        is_available: size.is_available,
      })),
    }))
}

export interface LockProductResponse {
  expires_at: string
}

export async function lockProduct(
  configId: string,
  sessionId: string,
): Promise<LockProductResponse> {
  const { data } = await api.post<LockProductResponse>('/api/cart/lock', {
    product_config_id: configId,
    session_id: sessionId,
  })
  return data
}
