import { Component, useState } from 'react'
import Module1 from './modules/Module1'
import Module2 from './modules/Module2'
import Module3 from './modules/Module3'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App render failed', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <h1 style={{ marginTop: 0 }}>Runtime Error</h1>
          <p>The page crashed while rendering. The details below should help us fix it quickly.</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {this.state.error.stack || this.state.error.message}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * App.jsx - Navigation Router
 * 
 * This file handles navigation between modules:
 * - Module 1: Meet the Neuron (Module1.jsx)
 * - Module 2: Seeing and Thinking (Module2.jsx)
 * - Module 3: Learning to Learn (Module3.jsx)
 */
function App() {
  const [currentView, setCurrentView] = useState('module1')

  const handleGoToModule2 = () => {
    setCurrentView('module2')
  }

  const handleGoToModule3 = () => {
    setCurrentView('module3')
  }

  const handleBackToModule1 = () => {
    setCurrentView('module1')
  }

  const handleBackToModule2 = () => {
    setCurrentView('module2')
  }

  // Render Module 3 if selected
  let content = <Module1 onContinue={handleGoToModule2} />

  if (currentView === 'module3') {
    content = <Module3 onBack={handleBackToModule2} />
  } else if (currentView === 'module2') {
    content = <Module2 onBack={handleBackToModule1} onContinue={handleGoToModule3} />
  }

  return <AppErrorBoundary>{content}</AppErrorBoundary>
}

export default App
