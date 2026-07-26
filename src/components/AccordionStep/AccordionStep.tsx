import type { Step } from '../types'
import { useAppState, useAppDispatch } from '../state/context'
import { getSelectedCountForStep } from '../state/selectors'
import { orderedSteps } from '../data/constants'
import { stepIconFor, ChevronIcon } from './icons'
import { ProductCard } from './ProductCard'
import './AccordionStep.css'

export function AccordionStep({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const isOpen = state.openStepId === step.id
  const products = Object.values(state.products).filter((product) => product.stepId === step.id)
  const selectedCount = getSelectedCountForStep(state, step.id)
  const nextStep = orderedSteps[index + 1]

  return (
    <section className={`accordion-step ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      <button
        type="button"
        className="step-header"
        onClick={() => dispatch({ type: 'TOGGLE_STEP', stepId: step.id })}
        aria-expanded={isOpen}
        aria-controls={`step-panel-${step.id}`}
      >
        <span className="step-kicker">STEP {index + 1} OF {totalSteps}</span>
        <span className="step-main">
          <span className="step-icon" aria-hidden="true">
            {stepIconFor(step.icon)}
          </span>
          <span className="step-title-wrap">
            <span className="step-title">{step.title}</span>
          </span>
        </span>
        <span className="step-status" aria-hidden="true">
          {isOpen ? (
            <>
              <ChevronIcon direction="up" />
              <span>{selectedCount} selected</span>
            </>
          ) : (
            <ChevronIcon direction="down" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="step-panel" id={`step-panel-${step.id}`}>
          <div className="product-grid" aria-label={`${step.title} products`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {nextStep ? (
            <div className="step-footer">
              <button
                type="button"
                className="next-button"
                onClick={() => dispatch({ type: 'OPEN_STEP', stepId: nextStep.id })}
              >
                Next: {nextStep.title}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
