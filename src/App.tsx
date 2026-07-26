import { useEffect, useState } from 'react'
import { AppProvider, useAppDispatch, useAppState } from './state/context'
import { APP_STATE_STORAGE_KEY } from './state/context'
import type { Product, Step } from './types'
import raw from './data/products.json'
import {
  displayPrice,
  formatCurrency,
  getGroupedLineItems,
  getPreDiscountTotal,
  getSavings,
  getSelectedCountForStep,
  getTotal,
} from './state/selectors'
import './App.css'

type AppData = {
  steps: Step[]
  products: Product[]
}

const data = raw as AppData

const orderedSteps = [...data.steps].sort((left, right) => left.order - right.order)
const reviewCategories: Product['reviewCategory'][] = ['Cameras', 'Sensors', 'Accessories', 'Plan']

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

function ReviewQuantityStepper({
  productId,
  variantId,
  quantity,
  minQuantity,
}: {
  productId: string
  variantId: string
  quantity: number
  minQuantity: number
}) {
  return <QuantityStepper productId={productId} variantId={variantId} quantity={quantity} minQuantity={minQuantity} />
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

function ReviewLineItemRow({
  product,
  variant,
}: {
  product: Product
  variant: Product['variants'][number]
}) {
  const showStepper = product.selectionType !== 'plan'
  const name = variant.label ? `${product.title} - ${variant.label}` : product.title

  return (
    <li className="review-line-item">
      <div className="review-line-thumb" aria-hidden="true">
        <img src={variant.image} alt="" />
      </div>
      <div className="review-line-main">
        <div className="review-line-heading-row">
          <span className="review-line-name">{name}</span>
          <span className="review-line-price">{displayPrice(variant)}</span>
        </div>
        {showStepper ? (
          <ReviewQuantityStepper
            productId={product.id}
            variantId={variant.id}
            quantity={variant.quantity}
            minQuantity={product.minQuantity}
          />
        ) : (
          <span className="review-line-note">Subscription item</span>
        )}
      </div>
    </li>
  )
}

function ReviewPanel() {
  const state = useAppState()
  const groupedLineItems = getGroupedLineItems(state)
  const total = getTotal(state)
  const preDiscountTotal = getPreDiscountTotal(state)
  const savings = getSavings(state)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const groupItemsFor = (category: Product['reviewCategory']) =>
    groupedLineItems.find((group) => group.category === category)?.items ?? []

  return (
    <aside className="review-shell" aria-label="Order summary">
      <header className="review-header">
        <p className="review-kicker">Review your bundle</p>
        <h2>Live order summary</h2>
        <p className="review-copy">
          Quantities update in sync with the cards. Active variants control the card display, and review rows follow the same state.
        </p>
      </header>

      <div className="review-panel">
        {reviewCategories.map((category) => {
          const items = groupItemsFor(category)

          return (
            <section key={category} className="review-category-section">
              <div className="review-category-header">
                <h3>{category}</h3>
                <span>{items.length}</span>
              </div>
              {items.length > 0 ? (
                <ul className="review-line-list">
                  {items.map((item) => (
                    <ReviewLineItemRow key={`${item.productId}-${item.variant.id}`} product={item.product} variant={item.variant} />
                  ))}
                </ul>
              ) : (
                <p className="review-empty">No items selected.</p>
              )}
            </section>
          )
        })}

        <div className="review-supporting-stack">
          <div className="shipping-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="guarantee-row">
            <div className="guarantee-seal" aria-hidden="true">
              <span>SATISFACTION</span>
              <strong>GUARANTEE</strong>
            </div>
            <div className="financing-pill">0% financing available</div>
          </div>

          <div className="total-block">
            <div className="total-line total-pre-discount">
              <span>Regular total</span>
              <span>{formatCurrency(preDiscountTotal)}</span>
            </div>
            <div className="total-line total-active">
              <span>Your total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <p className="savings-callout">Congrats! You&apos;re saving {formatCurrency(savings)} on your security bundle!</p>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() => {
              window.alert('Checkout coming soon.')
            }}
          >
            Checkout
          </button>

          <a
            className="save-link"
            href="#"
            onClick={(event) => {
              event.preventDefault()
              try {
                window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state))
                setSaveMessage('Saved locally')
              } catch {
                setSaveMessage('Could not save locally')
              }
            }}
          >
            Save my system for later
          </a>
          {saveMessage ? <p className="save-status" aria-live="polite">{saveMessage}</p> : null}
        </div>
      </div>
    </aside>
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
      <div className="layout-shell">
        <section className="builder-shell" aria-label="Security system builder">
          <header className="builder-header">
            <p className="builder-label">Security System Builder</p>
            <h1>Build your bundle</h1>
            <p className="builder-copy">
              Phase 3 introduced the accordion shell; phase 5 adds the live review panel and keeps quantities in sync.
            </p>
          </header>

          <div className="accordion-stack">
            {orderedSteps.map((step, index) => (
              <AccordionStep key={step.id} step={step} index={index} totalSteps={orderedSteps.length} />
            ))}
          </div>
        </section>

        <ReviewPanel />
      </div>
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
