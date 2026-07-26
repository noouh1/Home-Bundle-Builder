import type { Product, Variant } from '../types'
import type { AppState } from './reducer'

export type ReviewLineItem = {
  productId: string
  variant: Variant
  product: Product
}

export type CategoryGroup = {
  category: Product['reviewCategory']
  items: ReviewLineItem[]
}

const CATEGORY_ORDER: Product['reviewCategory'][] = ['Cameras', 'Sensors', 'Accessories', 'Plan']

export function getProductsInStep(state: AppState, stepId: string): Product[] {
  return state.stepOrder
    .filter((id) => id === stepId)
    .flatMap((_id) =>
      Object.values(state.products).filter((p) => p.stepId === stepId)
    )
}

export function getSelectedCountForStep(state: AppState, stepId: string): number {
  return Object.values(state.products)
    .filter((p) => p.stepId === stepId && p.variants.some((v) => v.quantity > 0))
    .length
}

export function getLineItems(state: AppState): ReviewLineItem[] {
  return Object.values(state.products).flatMap((product) =>
    product.variants
      .filter((v) => v.quantity > 0)
      .map((variant) => ({ productId: product.id, variant, product }))
  )
}

export function getGroupedLineItems(state: AppState): CategoryGroup[] {
  const items = getLineItems(state)
  const groups = new Map<Product['reviewCategory'], ReviewLineItem[]>()
  for (const item of items) {
    const cat = item.product.reviewCategory
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(item)
  }
  return CATEGORY_ORDER
    .filter((cat) => groups.has(cat))
    .map((category) => ({ category, items: groups.get(category)! }))
}

export function getTotal(state: AppState): number {
  return getLineItems(state).reduce((sum, item) => sum + item.variant.price * item.variant.quantity, 0)
}

export function getPreDiscountTotal(state: AppState): number {
  return getLineItems(state).reduce(
    (sum, item) => sum + (item.variant.compareAtPrice ?? item.variant.price) * item.variant.quantity,
    0
  )
}

export function getSavings(state: AppState): number {
  return getPreDiscountTotal(state) - getTotal(state)
}

export function displayPrice(variant: Variant): string {
  if (variant.price === 0 && variant.compareAtPrice != null) {
    return 'FREE'
  }
  return `$${variant.price.toFixed(2)}`
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
