import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import BridgeToAnn from './components/BridgeToAnn'
import InteractionSection from './components/InteractionSection'
import Module1AnatomySection from './components/Module1AnatomySection'
import Module1Intro from './components/Module1Intro'
import './module1.css'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { label: 'Introduction' },
  { label: 'Neuron Anatomy' },
  { label: 'Sound Experiment' },
  { label: 'Bridge to AI' },
]

function Module1({ onBack, onContinue }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const { activeIndex, visitedIndices, setRef, scrollTo, refs } = useScrollProgress(SECTIONS.length)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      refs.current.forEach((el) => {
        if (!el) return
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="module1-page">
      <ModuleNav
        current="module1"
        sections={SECTIONS}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
      />

      <main className="module1-main">
        <div ref={setRef(0)}>
          <Module1Intro onStart={() => scrollTo(1)} />
        </div>

        <div ref={setRef(1)} className="module1-anchor-section">
          <Module1AnatomySection onContinue={() => scrollTo(2)} />
        </div>

        <div ref={setRef(2)} className="module1-anchor-section">
          <InteractionSection isMobile={isMobile} />
        </div>

        <section ref={setRef(3)} className="module1-anchor-section">
          <BridgeToAnn onContinue={onContinue} />
        </section>
      </main>
    </div>
  )
}

export default Module1
