/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Product, Step } from '../types'
import { appReducer, createInitialState, type AppState, type Action } from './reducer'
import raw from '../data/products.json'

const data = raw as { steps: Step[]; products: Product[] }
export const APP_STATE_STORAGE_KEY = 'security-builder-state-v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isVariant(value: unknown): value is Product['variants'][number] {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    (typeof value.label === 'string' || value.label === null) &&
    (typeof value.chipIcon === 'string' || value.chipIcon === null) &&
    typeof value.image === 'string' &&
    typeof value.price === 'number' &&
    (typeof value.compareAtPrice === 'number' || value.compareAtPrice === null) &&
    typeof value.quantity === 'number'
  )
}

function isProduct(value: unknown): value is Product {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.stepId === 'string' &&
    typeof value.reviewCategory === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.image === 'string' &&
    typeof value.learnMoreUrl === 'string' &&
    (typeof value.badge === 'string' || value.badge === null) &&
    (typeof value.requiredLabel === 'string' || value.requiredLabel === undefined) &&
    (value.selectionType === 'quantity' || value.selectionType === 'plan') &&
    typeof value.minQuantity === 'number' &&
    typeof value.hasVariants === 'boolean' &&
    typeof value.activeVariantId === 'string' &&
    Array.isArray(value.variants) &&
    value.variants.every(isVariant)
  )
}

function isAppState(value: unknown): value is AppState {
  if (!isObject(value)) return false
  if (typeof value.openStepId !== 'string' || !Array.isArray(value.stepOrder) || !isObject(value.products)) {
    return false
  }

  return value.stepOrder.every((stepId) => typeof stepId === 'string') &&
    Object.values(value.products).every(isProduct)
}

function readPersistedState(): AppState | null {
  try {
    const rawState = window.localStorage.getItem(APP_STATE_STORAGE_KEY)
    if (!rawState) return null
    const parsed = JSON.parse(rawState) as unknown
    return isAppState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function createInitialAppState() {
  const persisted = typeof window !== 'undefined' ? readPersistedState() : null
  if (persisted) return persisted
  return createInitialState(data.steps, data.products)
}

const AppContext = createContext<AppState | null>(null)
const DispatchContext = createContext<React.Dispatch<Action> | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialAppState)
  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider')
  return ctx
}
