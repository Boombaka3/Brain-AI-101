import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectModuleSectionProgress, setModuleSectionProgress } from '../../store/progress'
import LearningProblem from './sections/foundations/LearningProblem'
import LearningTypes from './sections/foundations/LearningTypes'
import SectionCLab from './sections/foundations/SectionCLab'
import AdvancedLearningLabs from './sections/labs/AdvancedLearningLabs'
import BackpropagationSection from './sections/backprop/BackpropagationSection'
import BrainConnection from './sections/backprop/BrainConnection'
import BigPicture from './sections/backprop/BigPicture'
import './module3.css'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { label: 'Learning Means Changing' },
  { label: 'Feedback Changes Behavior' },
  { label: 'Error Goes Down Over Time' },
  { label: 'Backpropagation' },
  { label: 'Brain × AI Feedback' },
  { label: 'Feedback During Inference' },
  { label: 'Advanced Learning Labs' },
]

function Module3({ onBack, onContinue, onNavigate }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const dispatch = useAppDispatch()
  const savedProgress = useAppSelector(selectModuleSectionProgress('module3'))
  const handleProgressChange = useCallback(({ activeIndex: nextActiveIndex, visitedIndices: nextVisitedIndices }) => {
    dispatch(setModuleSectionProgress({
      moduleKey: 'module3',
      activeIndex: nextActiveIndex,
      visitedIndices: nextVisitedIndices,
    }))
  }, [dispatch])
  const { activeIndex, visitedIndices, setRef, scrollTo, refs } = useScrollProgress(SECTIONS.length, {
    initialActiveIndex: savedProgress.activeIndex,
    initialVisitedIndices: savedProgress.visitedIndices,
    onProgressChange: handleProgressChange,
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [refs])

  useEffect(() => {
    if (savedProgress.activeIndex <= 0) return

    const timeoutId = window.setTimeout(() => {
      scrollTo(savedProgress.activeIndex)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [savedProgress.activeIndex, scrollTo])

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
        onCourseStepClick={onNavigate}
      />

      <main className="m3-main">
        <div ref={setRef(0)}><LearningProblem /></div>
        <div ref={setRef(1)}><LearningTypes isMobile={isMobile} onJumpToSectionC={() => scrollTo(2)} /></div>
        <div ref={setRef(2)}><SectionCLab /></div>
        <div ref={setRef(3)}><BackpropagationSection /></div>
        <div ref={setRef(4)}><BrainConnection /></div>
        <div ref={setRef(5)}><BigPicture /></div>
        <div ref={setRef(6)}><AdvancedLearningLabs /></div>

        <section className="m3-section m3-continue-section">
          <div className="m3-continue-card" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onContinue?.()}>
            <p className="m3-eyebrow">Congratulations!</p>
            <h2>Continue to Course Evaluation</h2>
            <p className="m3-section-subtitle">Share feedback, reflect on the course, and complete the final knowledge check before the completion page.</p>
            <span className="m3-continue-btn">Continue to Course Evaluation</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Module3
