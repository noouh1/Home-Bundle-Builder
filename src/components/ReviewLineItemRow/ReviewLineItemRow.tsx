import type { Product } from '../../types'
import { displayPrice } from '../../state/selectors'
import { ProductArtwork } from '../ProductArtwork/ProductArtwork'
import { ReviewQuantityStepper } from '../QuantityStepper/QuantityStepper'
import './ReviewLineItemRow.css'

export function ReviewLineItemRow({
  product,
  variant,
}: {
  product: Product
  variant: Product['variants'][number]
}) {
  const showStepper = product.selectionType !== 'plan'
  const name = variant.label ? `${product.title} - ${variant.label}` : product.title
  const isFree = variant.price === 0 && variant.compareAtPrice != null

  return (
    <li className={`review-line-item${!showStepper ? ' is-plan' : ''}`}>
      {showStepper ? (
        <div className="review-line-thumb" aria-hidden="true">
          <ProductArtwork product={product} variant={variant} compact />
        </div>
      ) : null}
      <div className="review-line-main">
        <div className="review-line-heading-row">
          <span className="review-line-name">{name}</span>
          <span className={`review-line-price${isFree ? ' is-free' : ''}`}>{displayPrice(variant)}</span>
        </div>
        {showStepper ? (
          <ReviewQuantityStepper
            productId={product.id}
            variantId={variant.id}
            quantity={variant.quantity}
            minQuantity={product.minQuantity}
          />
        ) : (
          <span className="review-line-note">Plan item — no quantity needed</span>
        )}
      </div>
    </li>
  )
}
