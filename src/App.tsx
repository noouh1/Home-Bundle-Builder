import type { Step, Product } from './types'
import raw from './data/products.json'

const data = raw as { steps: Step[]; products: Product[] }

function App() {
  return (
    <pre style={{ fontSize: 13, lineHeight: 1.5 }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export default App
