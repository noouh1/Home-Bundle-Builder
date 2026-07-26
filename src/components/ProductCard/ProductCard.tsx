import type { Product } from '../../types'
import { displayPrice, formatCurrency } from '../../state/selectors'
import { ProductArtwork } from '../ProductArtwork/ProductArtwork'
import { VariantChipSelector } from '../VariantChipSelector/VariantChipSelector'
import { QuantityStepper } from '../QuantityStepper/QuantityStepper'
import './ProductCard.css'

export function ProductCard({ product }: { product: Product }) {
  const activeVariant = product.variants.find((variant) => variant.id === product.activeVariantId) ?? product.variants[0]
  const activeQuantity = activeVariant?.quantity ?? 0
  const isSelected = activeQuantity > 0
  const activePrice = displayPrice(activeVariant)
  const isFree = activeVariant.price === 0 && activeVariant.compareAtPrice != null

  return (
    <article className={`product-card${isSelected ? ' is-selected' : ''}`}>
      <div className="product-card-media">
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        <ProductArtwork product={product} variant={activeVariant} />
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
            <span className={`price-active${isFree ? ' is-free' : ''}`}>{activePrice}</span>
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
          ) : null}
        </div>
      </div>
    </article>
  )
}
