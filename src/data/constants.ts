import type { Product, Step } from '../types'
import raw from './products.json'

type AppData = {
  steps: Step[]
  products: Product[]
}

const data = raw as AppData

export const orderedSteps = [...data.steps].sort((left, right) => left.order - right.order)
export const reviewCategories: Product['reviewCategory'][] = ['Cameras', 'Sensors', 'Accessories', 'Plan']
