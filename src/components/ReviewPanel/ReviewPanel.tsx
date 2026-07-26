import { useState } from 'react'
import { useAppState } from '../../state/context'
import { APP_STATE_STORAGE_KEY } from '../../state/context'
import { getGroupedLineItems, getPreDiscountTotal, getSavings, getTotal, formatCurrency } from '../../state/selectors'
import { reviewCategories } from '../../data/constants'
import { ReviewLineItemRow } from '../ReviewLineItemRow/ReviewLineItemRow'
import './ReviewPanel.css'

export function ReviewPanel() {
  const state = useAppState()
  const groupedLineItems = getGroupedLineItems(state)
  const total = getTotal(state)
  const preDiscountTotal = getPreDiscountTotal(state)
  const savings = getSavings(state)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const groupItemsFor = (category: string) =>
    groupedLineItems.find((group) => group.category === category)?.items ?? []

  return (
    <aside className="review-shell" aria-label="Order summary">
      <header className="review-header">
        <p className="review-kicker">Review your bundle</p>
        <h2>Live order summary</h2>
        <p className="review-copy">
          Your selections update in real time. Adjust quantities from any view and see your total change instantly.
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
            {savings > 0 ? (
              <p className="savings-callout">Congrats! You&apos;re saving {formatCurrency(savings)} on your security bundle!</p>
            ) : null}
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
