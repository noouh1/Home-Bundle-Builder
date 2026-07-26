import { useEffect, useState } from 'react'
import { AppProvider, useAppDispatch, useAppState } from './state/context'
import type { Product, Step } from './types'
import raw from './data/products.json'
import { displayPrice, formatCurrency, getSelectedCountForStep } from './state/selectors'
import './App.css'

type AppData = {
  steps: Step[]
  products: Product[]
}

const data = raw as AppData

const orderedSteps = [...data.steps].sort((left, right) => left.order - right.order)

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

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (hasError) {
    return (
      <div className="product-image-fallback" aria-hidden="true">
        <span>{alt}</span>
      </div>
    )
  }

  return <img className="product-image" src={src} alt={alt} onError={() => setHasError(true)} />
}

function QuantityStepper({ productId, variantId, quantity, minQuantity }: {
  productId: string
  variantId: string
  quantity: number
  minQuantity: number
}) {
  const dispatch = useAppDispatch()
  const isAtFloor = quantity <= minQuantity

  return (
    <div className="quantity-stepper" aria-label="Quantity stepper">
      <button
        type="button"
        className="stepper-button"
        onClick={() => dispatch({ type: 'SET_QUANTITY', productId, variantId, quantity: quantity - 1 })}
        disabled={isAtFloor}
        aria-label="Decrease quantity"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span className="stepper-value" aria-live="polite">{quantity}</span>
      <button
        type="button"
        className="stepper-button"
        onClick={() => dispatch({ type: 'SET_QUANTITY', productId, variantId, quantity: quantity + 1 })}
        aria-label="Increase quantity"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}

function VariantChipSelector({ product }: { product: Product }) {
  const dispatch = useAppDispatch()
  const activeVariant = product.variants.find((variant) => variant.id === product.activeVariantId) ?? product.variants[0]

  return (
    <div className="variant-chip-list" aria-label={`${product.title} color options`}>
      {product.variants.map((variant) => {
        const isActive = variant.id === activeVariant.id
        return (
          <button
            key={variant.id}
            type="button"
            className={`variant-chip${isActive ? ' is-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VARIANT', productId: product.id, variantId: variant.id })}
            aria-pressed={isActive}
          >
            <span className="variant-chip-icon" aria-hidden="true">
              {variant.chipIcon ? <img src={variant.chipIcon} alt="" /> : <span className="variant-chip-dot" />}
            </span>
            <span>{variant.label ?? 'Default'}</span>
          </button>
        )
      })}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const activeVariant = product.variants.find((variant) => variant.id === product.activeVariantId) ?? product.variants[0]
  const activeQuantity = activeVariant?.quantity ?? 0
  const isSelected = activeQuantity > 0
  const activePrice = displayPrice(activeVariant)

  return (
    <article className={`product-card${isSelected ? ' is-selected' : ''}`}>
      <div className="product-card-media">
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        <ProductImage src={activeVariant.image} alt={product.title} />
      </div>

      <div className="product-card-body">
        <div className="product-title-row">
          <h3 className="product-title">{product.title}</h3>
          {product.requiredLabel ? <span className="required-pill">{product.requiredLabel}</span> : null}
        </div>
        <p className="product-description">{product.description}</p>
        <a className="learn-more-link" href={product.learnMoreUrl} onClick={(event) => event.preventDefault()}>
          Learn More
        </a>

        {product.hasVariants ? <VariantChipSelector product={product} /> : null}

        <div className="product-meta-row">
          <div className="price-block">
            <span className="price-active">{activePrice}</span>
            {activeVariant.compareAtPrice != null ? (
              <span className="price-compare">{formatCurrency(activeVariant.compareAtPrice)}</span>
            ) : null}
          </div>

          {product.selectionType !== 'plan' ? (
            <QuantityStepper
              productId={product.id}
              variantId={activeVariant.id}
              quantity={activeVariant.quantity}
              minQuantity={product.minQuantity}
            />
          ) : (
            <span className="plan-note">Subscription line</span>
          )}
        </div>

        {product.selectionType === 'plan' ? (
          <div className="product-note">Plan selection only - no quantity stepper.</div>
        ) : null}
      </div>
    </article>
  )
}

function AccordionStep({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) {
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

function BuilderColumn() {
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
