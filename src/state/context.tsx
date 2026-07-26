import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Product, Step } from '../types'
import { appReducer, createInitialState, type AppState, type Action } from './reducer'
import raw from '../data/products.json'

const data = raw as { steps: Step[]; products: Product[] }

const AppContext = createContext<AppState | null>(null)
const DispatchContext = createContext<React.Dispatch<Action> | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, data, (d) =>
    createInitialState(d.steps, d.products)
  )
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
