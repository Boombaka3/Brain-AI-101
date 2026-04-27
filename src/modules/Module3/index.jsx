import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import LearningProblem from './components/LearningProblem'
import LearningTypes from './components/LearningTypes'
import TrainingLab from './components/TrainingLab'
import BrainConnection from './components/BrainConnection'
import BigPicture from './components/BigPicture'
import './module3.css'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { label: 'Fixed vs Learning' },
  { label: 'Three Ways to Learn' },
  { label: 'Training Pipeline' },
  { label: 'Brain Connection' },
  { label: 'Big Picture' },
]

function Module3({ onBack, onContinue }) {
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
    <div className="module3-page">
      <ModuleNav
        current="module3"
        sections={SECTIONS}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
      />

      <main className="m3-main">
        <div ref={setRef(0)}><LearningProblem /></div>
        <div ref={setRef(1)}><LearningTypes isMobile={isMobile} /></div>
        <div ref={setRef(2)}><TrainingLab /></div>
        <div ref={setRef(3)}><BrainConnection /></div>
        <div ref={setRef(4)}><BigPicture /></div>

        <section className="m3-section m3-continue-section">
          <div className="m3-continue-card" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onContinue?.()}>
            <p className="m3-eyebrow">Congratulations!</p>
            <h2>You've Completed All Modules</h2>
            <p className="m3-section-subtitle">See what you've learned and what to explore next.</p>
            <span className="m3-continue-btn">See What's Next</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Module3
