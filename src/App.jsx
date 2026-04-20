import { Component, lazy, Suspense, useState } from 'react'
import useSmoothScroll from './hooks/useSmoothScroll'
import Module1 from './modules/Module1'
import Module2 from './modules/Module2'
import Module3 from './modules/Module3'

const LandingPage = lazy(() => import('./pages/LandingPage'))

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

function App() {
  const [currentView, setCurrentView] = useState('landing')
  useSmoothScroll()

  const goTo = (view) => {
    setCurrentView(view)
    window.scrollTo({ top: 0 })
  }

  let content

  if (currentView === 'landing') {
    content = (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F8FBFF' }} />}>
        <LandingPage onStart={() => goTo('module1')} />
      </Suspense>
    )
  } else if (currentView === 'module1') {
    content = <Module1 onContinue={() => goTo('module2')} />
  } else if (currentView === 'module2') {
    content = <Module2 onBack={() => goTo('module1')} onContinue={() => goTo('module3')} />
  } else if (currentView === 'module3') {
    content = <Module3 onBack={() => goTo('module2')} />
  }

  return <AppErrorBoundary>{content}</AppErrorBoundary>
}

export default App
