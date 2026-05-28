import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import ANNSection from './sections/networks/ANNSection'
import ActivationSection from './sections/activations/ActivationSection'
import SpecialistsSection from './sections/selectivity/SpecialistsSection'
import ScanningSection from './sections/cnn/ScanningSection'
import CnnExplainerSection from './sections/cnn/CnnExplainerSection'
import './module2.css'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { label: 'Neural Networks' },
  { label: 'Activation Functions' },
  { label: 'Neural Selectivity' },
  { label: 'CNNs' },
  { label: 'CNN Explainer' },
]

function Module2({ onBack, onContinue, onNavigate }) {
  const { activeIndex, visitedIndices, setRef, scrollTo, refs } = useScrollProgress(SECTIONS.length)

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
  }, [refs])

  return (
    <div className="module2-page">
      <ModuleNav
        current="module2"
        sections={SECTIONS}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
        onCourseStepClick={onNavigate}
      />

      <main className="m2-main">
        <div ref={setRef(0)}><ANNSection /></div>
        <div ref={setRef(1)}><ActivationSection /></div>
        <div ref={setRef(2)}><SpecialistsSection /></div>
        <div ref={setRef(3)}><ScanningSection /></div>
        <div ref={setRef(4)}><CnnExplainerSection /></div>

        <section className="m2-section m2-continue-section">
          <div className="m2-continue-card" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onContinue?.()}>
            <p className="m2-eyebrow">Up Next</p>
            <h2>Module 3: Learning to Learn</h2>
            <p className="m2-section-subtitle">How do networks learn their own weights? Discover training, loss, and the brain's version of gradient descent.</p>
            <span className="m2-continue-btn">Continue</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Module2
