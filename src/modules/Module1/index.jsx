import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BiologyDiagram from '../../components/diagrams/BiologyDiagram'
import ProgressRail from '../../components/ui/ProgressRail'
import TimeIndicator from '../../components/ui/TimeIndicator'
import BridgeToAnn from './components/BridgeToAnn'
import InteractionSection from './components/InteractionSection'
import Module1Intro from './components/Module1Intro'
import './module1.css'

gsap.registerPlugin(ScrollTrigger)

function Module1({ onContinue }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const processRef = useRef(null)
  const bridgeRef = useRef(null)
  const interactionRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Diagram section entrance
      if (processRef.current) {
        gsap.from(processRef.current, {
          scrollTrigger: { trigger: processRef.current, start: 'top 82%', once: true },
          y: 28, opacity: 0, duration: 0.7, ease: 'power2.out',
        })
      }
      // Interaction section slide in
      if (interactionRef.current) {
        gsap.from(interactionRef.current, {
          scrollTrigger: { trigger: interactionRef.current, start: 'top 80%', once: true },
          y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
        })
      }
      // Bridge section
      if (bridgeRef.current) {
        gsap.from(bridgeRef.current, {
          scrollTrigger: { trigger: bridgeRef.current, start: 'top 80%', once: true },
          y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
        })
      }
    })
    return () => ctx.revert()
  }, [])

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="module1-page">
      <header className="module1-header">
        <div className="module1-header-row">
          <div className="module1-header-left">
            <span className="module1-header-badge">01</span>
            <div>
              <h1 className="module1-title">Biological Neuron</h1>
              <p className="module1-header-sub">~12 min · Neuron Fundamentals</p>
            </div>
          </div>
          <div className="module1-header-right">
            <TimeIndicator minutes={12} label="Neuron Fundamentals" active />
            <button className="module1-ghost-button" onClick={() => scrollToRef(bridgeRef)}>
              Skip to Bridge
            </button>
          </div>
        </div>
        <ProgressRail currentModule="module1" />
      </header>

      <main className="module1-main">
        <Module1Intro onStart={() => scrollToRef(processRef)} />

        <section ref={processRef} className="module1-anchor-section">
          <section className="module1-section module1-process-section">
            <div className="module1-section-heading module1-process-heading">
              <h2>Anatomy of a Neuron</h2>
              <p>
                Dendrites receive signals. The soma sums them. The axon carries the result.
                Below is the architecture — in the next section, you'll put it to work.
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

        <div ref={interactionRef}>
          <InteractionSection isMobile={isMobile} />
        </div>

        <section ref={bridgeRef} className="module1-anchor-section">
          <BridgeToAnn onContinue={onContinue} />
        </section>
      </main>
    </div>
  )
}

export default Module1
