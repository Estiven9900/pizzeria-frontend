import axios from 'axios'
import { ENV } from '../config/env'

const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Tipos normalizados (frontend) ────────────────────────────────────────────

export interface CatalogSize {
  product_config_id: string
  name: string
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

// ─── Formato real del backend: array de PizzaCatalogItem ─────────────────────
// GET /api/products → PizzaCatalogItem[]
// Cada item: { id, name, description, image_url, sizes[{ product_config_id, size, price, sku, is_available }] }

interface BackendSizeOption {
  product_config_id: string
  size: string
  price: number
  sku: string | null
  is_available: boolean
}

interface BackendCatalogItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sizes: BackendSizeOption[]
}

function mapBackendCatalogArray(data: BackendCatalogItem[]): CatalogResponse {
  return {
    pizzas: data
      .filter((item) => item.sizes.length > 0)
      .map((item) => ({
        pizzaName: item.name,
        imageUrl: item.image_url ?? undefined,
        sizes: item.sizes.map((size) => ({
          product_config_id: size.product_config_id,
          name: size.size,
          price: size.price,
          sku: size.sku ?? '',
          is_available: size.is_available,
        })),
      })),
  }
}

// ─── Formatos legacy (agrupado o tablas separadas) ────────────────────────────

interface GroupedCatalogSize {
  product_config_id: string | number
  name?: string
  sizeName?: string
  price: number | string
  sku?: string
  is_available: boolean
}

interface GroupedCatalogPizza {
  pizzaName: string
  imageUrl?: string
  sizes: GroupedCatalogSize[]
}

interface GroupedCatalogResponse {
  pizzas: GroupedCatalogPizza[]
}

interface CatalogTablePizza {
  id: string | number
  name: string
  image_url?: string | null
}

interface CatalogTableSize {
  id: string | number
  name: string
}

interface CatalogTableProductConfig {
  id: string | number
  pizza_id: string | number
  size_id: string | number
  price: number | string
  sku?: string
  is_available: boolean
}

interface CatalogTablesResponse {
  pizzas: CatalogTablePizza[]
  sizes: CatalogTableSize[]
  product_configs: CatalogTableProductConfig[]
}

type CatalogApiResponse = GroupedCatalogResponse | CatalogTablesResponse

function toNumber(value: number | string): number {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function mapGroupedCatalogResponse(data: GroupedCatalogResponse): CatalogResponse {
  return {
    pizzas: data.pizzas
      .map((pizza) => ({
        pizzaName: pizza.pizzaName,
        imageUrl: pizza.imageUrl,
        sizes: pizza.sizes.map((size) => ({
          product_config_id: String(size.product_config_id),
          name: size.name ?? size.sizeName ?? '',
          price: toNumber(size.price),
          sku: size.sku ?? '',
          is_available: Boolean(size.is_available),
        })),
      }))
      .filter((pizza) => pizza.sizes.length > 0),
  }
}

function mapTablesCatalogResponse(data: CatalogTablesResponse): CatalogResponse {
  const sizeNameById = new Map<string, string>(
    data.sizes.map((size) => [String(size.id), size.name]),
  )

  const pizzaById = new Map<string, CatalogPizza>()

  for (const pizza of data.pizzas) {
    pizzaById.set(String(pizza.id), {
      pizzaName: pizza.name,
      imageUrl: pizza.image_url ?? undefined,
      sizes: [],
    })
  }

  for (const config of data.product_configs) {
    const pizza = pizzaById.get(String(config.pizza_id))
    const sizeName = sizeNameById.get(String(config.size_id))

    if (!pizza || !sizeName) {
      continue
    }

    pizza.sizes.push({
      product_config_id: String(config.id),
      name: sizeName,
      price: toNumber(config.price),
      sku: config.sku ?? '',
      is_available: Boolean(config.is_available),
    })
  }

  return {
    pizzas: Array.from(pizzaById.values()).filter((pizza) => pizza.sizes.length > 0),
  }
}

function isCatalogTablesResponse(data: CatalogApiResponse): data is CatalogTablesResponse {
  return 'sizes' in data && 'product_configs' in data
}

// ─── Fetch principal ──────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<CatalogResponse> {
  const { data } = await api.get<unknown>('/api/products')

  // Formato real del backend: array plano de PizzaCatalogItem
  if (Array.isArray(data)) {
    return mapBackendCatalogArray(data as BackendCatalogItem[])
  }

  // Formatos legacy: diccionario con tablas separadas o agrupado
  const legacyData = data as CatalogApiResponse
  if (isCatalogTablesResponse(legacyData)) {
    return mapTablesCatalogResponse(legacyData)
  }

  return mapGroupedCatalogResponse(legacyData as GroupedCatalogResponse)
}

export interface LockCartItemRequest {
  product_config_id: string
  session_id: string
}

export interface LockCartItemResponse {
  expires_at: string
}

export async function lockCartItem(
  productConfigId: string,
  sessionId: string,
): Promise<LockCartItemResponse> {
  const { data } = await api.post<LockCartItemResponse>('/api/cart/lock', {
    product_config_id: productConfigId,
    session_id: sessionId,
  })
  return data
}

export default api
