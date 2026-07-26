import { useState } from 'react'
import type { Product } from '../../types'
import { getArtworkKind, getArtworkTone, ProductVectorArt } from '../ProductVectorArt'
import './ProductArtwork.css'

export function ProductArtwork({ product, variant, compact = false }: { product: Product; variant: Product['variants'][number]; compact?: boolean }) {
  const kind = getArtworkKind(product)
  const tone = getArtworkTone(variant.label, kind)
  const title = variant.label ? `${product.title} ${variant.label}` : product.title
  const photoUrl = variant.image ?? product.image
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = !!photoUrl && !photoFailed

  return (
    <div
      className={`product-artwork product-artwork-${kind}${compact ? ' is-compact' : ''}${showPhoto ? ' has-photo' : ''}`}
      style={{ background: `linear-gradient(180deg, ${tone.base}, rgba(255, 255, 255, 0.92))`, color: tone.accent, boxShadow: `inset 0 0 0 1px rgba(79, 70, 229, 0.08), 0 14px 24px ${tone.glow}` }}
    >
      {showPhoto ? (
        <img
          className="product-artwork-photo"
          src={photoUrl}
          alt={title}
          loading="lazy"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <>
          <span className="product-artwork-sheen" aria-hidden="true" />
          <div aria-hidden="true"><ProductVectorArt kind={kind} /></div>
        </>
      )}
      {!showPhoto ? (
        <div className="product-artwork-label">
          <span>{compact ? (variant.label ?? product.title.split(' ')[0]) : title}</span>
        </div>
      ) : null}
    </div>
  )
}
