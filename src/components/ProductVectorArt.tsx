/* eslint-disable react-refresh/only-export-components */
import type { Product } from '../types'
import './ProductArtwork.css'

export type ArtworkKind = 'camera' | 'plan' | 'sensor' | 'accessory'

export function getArtworkKind(product: Product): ArtworkKind {
  switch (product.stepId) {
    case 'cameras':
      return 'camera'
    case 'plan':
      return 'plan'
    case 'sensors':
      return 'sensor'
    default:
      return 'accessory'
  }
}

export function getArtworkTone(label: string | null, kind: ArtworkKind) {
  const normalized = label?.toLowerCase() ?? ''

  if (normalized.includes('black')) {
    return { base: 'rgba(15, 23, 42, 0.98)', glow: 'rgba(79, 70, 229, 0.2)', accent: '#eef2ff' }
  }

  if (normalized.includes('grey') || normalized.includes('gray')) {
    return { base: 'rgba(148, 163, 184, 0.92)', glow: 'rgba(79, 70, 229, 0.18)', accent: '#f8fafc' }
  }

  if (normalized.includes('white')) {
    return { base: 'rgba(244, 246, 255, 0.98)', glow: 'rgba(79, 70, 229, 0.12)', accent: '#4f46e5' }
  }

  if (kind === 'plan') {
    return { base: 'rgba(79, 70, 229, 0.1)', glow: 'rgba(79, 70, 229, 0.18)', accent: '#4f46e5' }
  }

  if (kind === 'sensor') {
    return { base: 'rgba(79, 70, 229, 0.08)', glow: 'rgba(79, 70, 229, 0.14)', accent: '#4f46e5' }
  }

  return { base: 'rgba(79, 70, 229, 0.12)', glow: 'rgba(79, 70, 229, 0.18)', accent: '#4f46e5' }
}

const fallbackUrl = (kind: ArtworkKind) => {
  const map: Record<ArtworkKind, string> = {
    camera: 'https://www.wyze.com/cdn/shop/files/wyze-cam-v4-wyze-labs-inc-5186547.png?v=1762447655&width=713',
    plan: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop&auto=format&q=80',
    sensor: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop&auto=format&q=80',
    accessory: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&auto=format&q=80',
  }
  return map[kind]
}

export function ProductVectorArt({ kind }: { kind: ArtworkKind }) {
  return (
    <img
      className="product-artwork-fallback-photo"
      src={fallbackUrl(kind)}
      alt=""
      loading="lazy"
    />
  )
}
