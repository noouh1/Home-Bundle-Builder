import { AppProvider } from './state/context'
import { DebugPanel } from './components/DebugPanel'

function App() {
  const isDebug = new URLSearchParams(window.location.search).has('debug')

  return (
    <AppProvider>
      <div style={{ padding: 24 }}>
        <h1>Security System Builder</h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Phase 2 — global state ready. Add <code>?debug=1</code> to the URL to open the debug panel.
        </p>
        {isDebug && <DebugPanel />}
      </div>
    </AppProvider>
  )
}

export default App
