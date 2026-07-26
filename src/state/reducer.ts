import type { Product, Variant } from '../types'

export type AppState = {
  products: Record<string, Product>
  openStepId: string
  stepOrder: string[]
}

export type Action =
  | { type: 'SET_ACTIVE_VARIANT'; productId: string; variantId: string }
  | { type: 'SET_QUANTITY'; productId: string; variantId: string; quantity: number }
  | { type: 'SELECT_PLAN'; productId: string }
  | { type: 'OPEN_STEP'; stepId: string }
  | { type: 'TOGGLE_STEP'; stepId: string }
  | { type: 'HYDRATE'; state: AppState }

export function createInitialState(steps: { id: string }[], products: Product[]): AppState {
  return {
    products: Object.fromEntries(products.map((p) => [p.id, p])),
    openStepId: steps.length > 0 ? steps[0].id : '',
    stepOrder: steps.map((s) => s.id),
  }
}

function clamp(value: number, min: number): number {
  return Math.max(value, min)
}

function updateVariantInProduct(
  product: Product,
  variantId: string,
  updater: (v: Variant) => Variant
): Product {
  return {
    ...product,
    variants: product.variants.map((v) => (v.id === variantId ? updater(v) : v)),
  }
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_VARIANT': {
      const product = state.products[action.productId]
      if (!product) return state
      return {
        ...state,
        products: {
          ...state.products,
          [action.productId]: { ...product, activeVariantId: action.variantId },
        },
      }
    }

    case 'SET_QUANTITY': {
      const product = state.products[action.productId]
      if (!product) return state
      if (product.selectionType === 'plan') return state
      return {
        ...state,
        products: {
          ...state.products,
          [action.productId]: updateVariantInProduct(
            product,
            action.variantId,
            (v) => ({ ...v, quantity: clamp(action.quantity, product.minQuantity) })
          ),
        },
      }
    }

    case 'SELECT_PLAN': {
      const selected = state.products[action.productId]
      if (!selected || selected.selectionType !== 'plan') return state
      const isSelected = selected.variants[0].quantity > 0
      const updated = { ...state.products }
      for (const [id, product] of Object.entries(updated)) {
        if (product.selectionType === 'plan') {
          updated[id] = updateVariantInProduct(product, product.variants[0].id, (v) => ({
            ...v,
            quantity: id === action.productId ? (isSelected ? 0 : 1) : 0
          }))
        }
      }
      return { ...state, products: updated }
    }

    case 'OPEN_STEP': {
      return { ...state, openStepId: action.stepId }
    }

    case 'TOGGLE_STEP': {
      return {
        ...state,
        openStepId: state.openStepId === action.stepId ? '' : action.stepId,
      }
    }

    case 'HYDRATE': {
      return action.state
    }

    default:
      return state
  }
}
