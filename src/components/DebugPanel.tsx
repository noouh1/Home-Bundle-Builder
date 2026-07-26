import { useAppState, useAppDispatch } from '../state/context'
import { getSelectedCountForStep, getGroupedLineItems, getTotal, getPreDiscountTotal, getSavings, displayPrice } from '../state/selectors'

const panelStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: 16,
  marginTop: 16,
  fontSize: 13,
  fontFamily: 'monospace',
  background: '#fafafa',
  maxHeight: 400,
  overflow: 'auto',
}

const btnStyle: React.CSSProperties = {
  marginRight: 8,
  marginBottom: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
}

export function DebugPanel() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const total = getTotal(state)
  const pre = getPreDiscountTotal(state)
  const savings = getSavings(state)
  const groups = getGroupedLineItems(state)

  const firstProductId = Object.keys(state.products)[0]
  const firstProduct = firstProductId ? state.products[firstProductId] : null

  return (
    <div style={panelStyle}>
      <strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>🧪 Debug Panel</strong>

      <div style={{ marginBottom: 12 }}>
        <strong>Actions:</strong><br />
        <button
          style={btnStyle}
          onClick={() => {
            if (firstProduct) {
              const whiteV = firstProduct.variants.find((v) => v.id === 'white')
              const q = (whiteV?.quantity ?? 0) + 1
              dispatch({ type: 'SET_QUANTITY', productId: firstProduct.id, variantId: 'white', quantity: q })
            }
          }}
        >
          +1 Cam v4 White qty
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            if (firstProduct) {
              const whiteV = firstProduct.variants.find((v) => v.id === 'white')
              const q = Math.max((whiteV?.quantity ?? 0) - 1, 0)
              dispatch({ type: 'SET_QUANTITY', productId: firstProduct.id, variantId: 'white', quantity: q })
            }
          }}
        >
          -1 Cam v4 White qty
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            if (firstProduct) {
              dispatch({ type: 'SET_ACTIVE_VARIANT', productId: firstProduct.id, variantId: 'black' })
            }
          }}
        >
          Switch to Black variant
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            if (firstProduct) {
              dispatch({ type: 'SET_ACTIVE_VARIANT', productId: firstProduct.id, variantId: 'white' })
            }
          }}
        >
          Switch to White variant
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            dispatch({ type: 'OPEN_STEP', stepId: 'sensors' })
          }}
        >
          Open Sensors step
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            dispatch({ type: 'TOGGLE_STEP', stepId: state.openStepId })
          }}
        >
          Toggle current step
        </button>
      </div>

      <div>
        <strong>State snapshot:</strong>
        <pre style={{ fontSize: 11, lineHeight: 1.4, maxHeight: 120, overflow: 'auto' }}>
          {JSON.stringify(
            {
              openStepId: state.openStepId,
              stepOrder: state.stepOrder,
              productCount: Object.keys(state.products).length,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div>
        <strong>Derived values:</strong>
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
          {state.stepOrder.map((stepId) => (
            <li key={stepId}>
              <strong>{stepId}</strong> selected: {getSelectedCountForStep(state, stepId)}
            </li>
          ))}
          <li>Total: <strong>${total.toFixed(2)}</strong></li>
          <li>Pre-discount total: <strong>${pre.toFixed(2)}</strong></li>
          <li>Savings: <strong>${savings.toFixed(2)}</strong></li>
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <strong>Line items (qty &gt; 0):</strong>
        <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
          {groups.map((g) =>
            g.items.map((item) => (
              <li key={`${item.productId}-${item.variant.id}`}>
                {item.product.title}
                {item.variant.label ? ` - ${item.variant.label}` : ''} × {item.variant.quantity} = {displayPrice(item.variant)}
                {item.product.selectionType === 'plan' ? ' [plan]' : ''}
                {item.product.minQuantity > 0 ? ' [required]' : ''}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
