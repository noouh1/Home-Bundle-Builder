import { AppProvider, useAppDispatch, useAppState } from './state/context'
import type { Product, Step } from './types'
import raw from './data/products.json'
import { getSelectedCountForStep } from './state/selectors'

type AppData = {
  steps: Step[]
  products: Product[]
}

const data = raw as AppData

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 7.75h2.2l1.2-1.6h4.2l1.2 1.6h2.2a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-5.5a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 18 6v5.1c0 4.1-2.4 7.4-6 9.4-3.6-2-6-5.3-6-9.4V6l6-2.5Z" />
      <path d="M9.2 12.3 11 14.1l3.9-4" />
    </svg>
  )
}

function SensorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 12a6.5 6.5 0 0 1 13 0" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <path d="M10.5 12a1.5 1.5 0 0 1 3 0" />
      <circle cx="12" cy="15.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="4.5" width="5" height="5" rx="1.2" />
      <rect x="14.5" y="4.5" width="5" height="5" rx="1.2" />
      <rect x="4.5" y="14.5" width="5" height="5" rx="1.2" />
      <rect x="14.5" y="14.5" width="5" height="5" rx="1.2" />
    </svg>
  )
}

function stepIconFor(name: string) {
  switch (name) {
    case 'camera':
      return <CameraIcon />
    case 'shield':
      return <ShieldIcon />
    case 'sensor':
      return <SensorIcon />
    default:
      return <GridIcon />
  }
}

function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`chevron chevron-${direction}`}>
      <path d="M6 14.25 12 8.5l6 5.75" />
    </svg>
  )
}

function AccordionStep({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const isOpen = state.openStepId === step.id
  const products = Object.values(state.products).filter((product) => product.stepId === step.id)
  const selectedCount = getSelectedCountForStep(state, step.id)
  const nextStep = data.steps[index + 1]

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
          <div className="placeholder-grid" aria-label={`${step.title} products`}>
            {products.map((product) => (
              <article key={product.id} className="placeholder-card">
                <span className="placeholder-eyebrow">Product</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
              </article>
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

function BuilderColumn() {
  const stepsById = new Map(data.steps.map((step) => [step.id, step] as const))
  const orderedSteps = data.steps.filter((step) => stepsById.has(step.id))

  return (
    <main className="app-shell">
      <section className="builder-shell" aria-label="Security system builder">
        <header className="builder-header">
          <p className="builder-label">Security System Builder</p>
          <h1>Build your bundle</h1>
          <p className="builder-copy">
            Phase 3 introduces the accordion shell only. Each section opens one at a time, and the current step keeps its own selection count.
          </p>
        </header>

        <div className="accordion-stack">
          {orderedSteps.map((step, index) => (
            <AccordionStep key={step.id} step={step} index={index} totalSteps={orderedSteps.length} />
          ))}
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <AppProvider>
      <BuilderColumn />
    </AppProvider>
  )
}

export default App
