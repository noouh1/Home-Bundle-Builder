import type { Product } from '../../types'
import { useAppDispatch } from '../../state/context'
import './VariantChipSelector.css'

export function VariantChipSelector({ product }: { product: Product }) {
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
            <span className="variant-chip-icon" aria-hidden="true" data-tone={variant.label?.toLowerCase() ?? 'default'}>
              <span className="variant-chip-mark" />
            </span>
            <span>{variant.label ?? 'Default'}</span>
          </button>
        )
      })}
    </div>
  )
}
