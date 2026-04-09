import axios from 'axios'
import type { AxiosError } from 'axios'
import { ENV } from '../config/env'
import { toastEmitter } from '../utils/toastEmitter'

// ─── Tipos públicos (usados por el store y la UI) ─────────────────────────────

/**
 * Representa un product_config del backend.
 * is_available es calculado por el backend a partir del stock real.
 */
export interface ProductConfig {
  product_config_id: string
  /** Nombre del tamaño (ej. "Pequeña", "Mediana", "Grande") según tabla sizes */
  name: string
  price: number
  sku: string
  is_available: boolean
}

/** Una pizza del catálogo con sus product_configs como sizes */
export interface CatalogPizza {
  pizzaName: string
  imageUrl?: string
  sizes: ProductConfig[]
}

export interface CatalogResponse {
  pizzas: CatalogPizza[]
}

/** Alias de compatibilidad con código que usa el nombre CatalogSize */
export type CatalogSize = ProductConfig

// ─── Tipos del backend (shape real del JSON) ──────────────────────────────────

interface BackendProductConfig {
  product_config_id: string
  size: string
  price: number
  sku: string | null
  is_available: boolean
}

interface BackendPizzaItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sizes: BackendProductConfig[]
}

// ─── Detección de errores de stock ────────────────────────────────────────────

/** Códigos que el backend puede devolver ante un problema de stock o lock */
const STOCK_ERROR_CODES = new Set([
  'OUT_OF_STOCK',
  'STOCK_UNAVAILABLE',
  'ITEM_NOT_AVAILABLE',
  'PRODUCT_LOCKED',
])

function extractStockErrorMessage(error: AxiosError): string | null {
  const status = error.response?.status
  const body = error.response?.data as Record<string, unknown> | undefined

  // 409 Conflict → reserva fallida o sin stock
  if (status === 409) {
    const msg = body?.message ?? body?.error
    return typeof msg === 'string' && msg.length > 0
      ? msg
      : 'El producto ya está reservado o no hay stock disponible.'
  }

  // 400/422 con código de error específico de stock
  if (status === 400 || status === 422) {
    const code = body?.code ?? body?.error
    if (typeof code === 'string' && STOCK_ERROR_CODES.has(code.toUpperCase())) {
      const msg = body?.message
      return typeof msg === 'string' && msg.length > 0
        ? msg
        : 'El tamaño seleccionado no está disponible en este momento.'
    }
  }

  return null
}

// ─── Instancia axios exclusiva para el catálogo ───────────────────────────────

const catalogApi = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

catalogApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const stockMessage = extractStockErrorMessage(error)

    if (stockMessage) {
      toastEmitter.error(stockMessage)
      return Promise.reject(error)
    }

    if (!error.response) {
      toastEmitter.error('No se pudo conectar con el servidor. Verifica tu conexión.')
      return Promise.reject(error)
    }

    if (error.response.status >= 500) {
      toastEmitter.error('Error del servidor. Inténtalo de nuevo en unos momentos.')
    }

    return Promise.reject(error)
  },
)

// ─── Mapeador ─────────────────────────────────────────────────────────────────

function mapBackendResponse(items: BackendPizzaItem[]): CatalogResponse {
  return {
    pizzas: items
      .filter((item) => item.sizes.length > 0)
      .map((item) => ({
        pizzaName: item.name,
        imageUrl: item.image_url ?? undefined,
        sizes: item.sizes.map((cfg) => ({
          product_config_id: cfg.product_config_id,
          name: cfg.size,
          price: cfg.price,
          sku: cfg.sku ?? '',
          is_available: cfg.is_available,
        })),
      })),
  }
}

// ─── RF-01: Carga del catálogo dinámico ──────────────────────────────────────

/**
 * Obtiene el catálogo de pizzas con sus product_configs.
 * Cada elemento de `sizes` es un product_config.
 * Si is_available es false, el botón de ese tamaño debe renderizarse
 * como disabled + opacity-50 en la UI.
 */
export async function fetchCatalog(): Promise<CatalogResponse> {
  const { data } = await catalogApi.get<BackendPizzaItem[]>('/api/products')
  // Guard: si el backend devuelve null, [] vacío u otro tipo inesperado,
  // mapBackendResponse recibe un array vacío y loadCatalog pone isLoading=false correctamente.
  return mapBackendResponse(Array.isArray(data) ? data : [])
}

// ─── RF-02: Lock de reserva ───────────────────────────────────────────────────
    
export interface LockProductResponse {
  expires_at: string
}

export async function lockProduct(
  configId: string,
  sessionId: string,
): Promise<LockProductResponse> {
  const { data } = await catalogApi.post<LockProductResponse>('/api/cart/lock', {
    product_config_id: configId,
    session_id: sessionId,
  })
  return data
}

// ─── RF-03: Checkout ──────────────────────────────────────────────────────────

export interface CheckoutItem {
  product_config_id: string
  quantity: number
}

export interface CheckoutRequest {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  reference_notes?: string
  session_id: string
  items: CheckoutItem[]
}

export interface CheckoutResponse {
  order_id: string
  status: string
  total: number
}

export async function submitCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await catalogApi.post<CheckoutResponse>('/api/orders/checkout', payload)
  return data
}
