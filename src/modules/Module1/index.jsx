import { useEffect, useRef, useState } from 'react'
import BiologyDiagram from '../../components/diagrams/BiologyDiagram'
import { BridgeToAnn, InteractionSection, Module1Intro } from './components'
import './module1.css'

function Module1({ onContinue }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const processRef = useRef(null)
  const bridgeRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="module1-page">
      <header className="module1-header">
        <div>
          <p className="module1-kicker">Brain-AI-101</p>
          <h1 className="module1-title">Module 1: Biological Neuron Experience</h1>
        </div>
        <button className="module1-primary-button" onClick={() => scrollToRef(bridgeRef)}>
          Skip to Bridge
        </button>
      </header>

      <main className="module1-main">
        <Module1Intro onStart={() => scrollToRef(processRef)} />

        <section ref={processRef} className="module1-anchor-section">
          <section className="module1-section module1-process-section">
            <div className="module1-section-heading module1-process-heading">
              <p className="module1-eyebrow">B. Neuron Diagram</p>
              <h2>Look at the parts of a neuron</h2>
              <p>
                This diagram shows the main parts of a biological neuron, including the dendrites, soma, axon, and
                terminal branches. In the next section, you'll adjust inputs and see how those parts work together.
              </p>
            </div>

            <div className="module1-process-storyboard" aria-label="Neuron structure reference">
              <div className="module1-hero-shell module1-process-visual">
                <div className="module1-process-diagram-frame">
                  <BiologyDiagram isMobile={isMobile} mode="static" />
                </div>
              </div>
            </div>

            <div className="module1-process-summary">
              <p className="module1-card-muted module1-process-summary-body">
                The diagram is a visual reference for the neuron parts you'll use in the interaction below.
              </p>
            </div>
          </section>
        </section>

        <InteractionSection />

        <section ref={bridgeRef} className="module1-anchor-section">
          <BridgeToAnn onContinue={onContinue} />
        </section>
      </main>
    </div>
  )
}

export default Module1
