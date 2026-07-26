/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import './icons.css'

const iconUrl = (id: string) => `https://images.unsplash.com/${id}?w=60&h=60&fit=crop&crop=center&auto=format&q=80`

export function CameraIcon() {
  return <img className="step-photo-icon" src={iconUrl('photo-1557821552-17105176677c')} alt="" aria-hidden="true" />
}

export function ShieldIcon() {
  return <img className="step-photo-icon" src={iconUrl('photo-1585386959984-a4155224a1ad')} alt="" aria-hidden="true" />
}

export function SensorIcon() {
  return <img className="step-photo-icon" src={iconUrl('photo-1518770660439-4636190af475')} alt="" aria-hidden="true" />
}

export function GridIcon() {
  return <img className="step-photo-icon" src={iconUrl('photo-1558618666-fcd25c85f82e')} alt="" aria-hidden="true" />
}

export function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`chevron chevron-${direction}`}>
      <path d="M6 14.25 12 8.5l6 5.75" />
    </svg>
  )
}

export function stepIconFor(name: string): ReactNode {
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
