import { useAppDispatch } from '../../state/context'
import './QuantityStepper.css'

export function QuantityStepper({ productId, variantId, quantity, minQuantity }: {
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

export function ReviewQuantityStepper({
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
