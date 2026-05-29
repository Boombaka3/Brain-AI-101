import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModuleNav from '../../components/ui/ModuleNav'
import useScrollProgress from '../../hooks/useScrollProgress'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectModuleSectionProgress, setModuleSectionProgress } from '../../store/progress'
import BridgeToAnn from './sections/bridge/BridgeToAnn'
import InteractionSection from './sections/interaction/InteractionSection'
import Module1AnatomySection from './sections/anatomy/Module1AnatomySection'
import Module1Intro from './sections/intro/Module1Intro'
import './module1.css'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { label: 'Introduction' },
  { label: 'Neuron Anatomy' },
  { label: 'Sound Experiment' },
  { label: 'Bridge to AI' },
]

function Module1({ onBack, onContinue, onNavigate }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)
  const dispatch = useAppDispatch()
  const savedProgress = useAppSelector(selectModuleSectionProgress('module1'))
  const handleProgressChange = useCallback(({ activeIndex: nextActiveIndex, visitedIndices: nextVisitedIndices }) => {
    dispatch(setModuleSectionProgress({
      moduleKey: 'module1',
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
    <div className="module1-page">
      <ModuleNav
        current="module1"
        sections={SECTIONS}
        activeIndex={activeIndex}
        visitedIndices={visitedIndices}
        onSectionClick={scrollTo}
        onBack={onBack}
        onCourseStepClick={onNavigate}
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
