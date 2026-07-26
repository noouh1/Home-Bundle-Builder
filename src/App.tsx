import { AppProvider } from './state/context'
import { BuilderColumn } from './components/BuilderColumn/BuilderColumn'
import './App.css'

function App() {
  return (
    <AppProvider>
      <BuilderColumn />
    </AppProvider>
  )
}

export default App
