import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../../styles/shared.css'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

const NeuronShowcase = lazy(() => import('../../components/three/NeuronShowcase'))

const NOISE_PATTERN = [
  0.2, 0.8, 0.1, 0.7, 0.3,
  0.6, 0.2, 0.9, 0.1, 0.5,
  0.1, 0.7, 0.3, 0.8, 0.2,
  0.9, 0.3, 0.6, 0.2, 0.7,
  0.2, 0.5, 0.1, 0.9, 0.3,
]

const EDGE_PATTERN = [
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.9, 0.9, 0.9, 0.9, 0.9,
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.05, 0.05, 0.9, 0.05, 0.05,
]

const ANATOMY_STEPS = [
  { label: 'Dendrites receive', color: 'blue' },
  { label: 'Soma integrates', color: 'green' },
  { label: 'Threshold fires', color: 'amber' },
  { label: 'Axon propagates', color: 'purple' },
]

const COURSE_MODULES = [
  { key: 'module1', mod: 'Module 1', label: 'Meet the Neuron', time: '~12 min', color: '#2D7EFF' },
  { key: 'module2', mod: 'Module 2', label: 'From Neurons to Patterns', time: '~22 min', color: '#7C3AED' },
  { key: 'module3', mod: 'Module 3', label: 'Learning Through Feedback', time: '~26 min', color: '#10B981' },
]

function DotGrid({ resolved }) {
  const pattern = resolved ? EDGE_PATTERN : NOISE_PATTERN

  return (
    <div className="lp-dot-grid">
      {pattern.map((v, i) => (
        <div
          key={i}
          className={`lp-dot${v > 0.5 ? ' lp-dot--active' : ''}`}
          style={{
            background: v > 0.5
              ? `rgba(45,126,255,${0.4 + v * 0.5})`
              : `rgba(203,213,225,${0.3 + v * 0.4})`,
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage({ onStart, onNavigate }) {
  const modulesRef = useRef(null)
  const patternRef = useRef(null)
  const [dotResolved, setDotResolved] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lp-hero-bg-text', {
        opacity: 0,
        scale: 0.92,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.1,
      })

      gsap.from('.lp-flank-left, .lp-flank-right, .lp-hero-bottom, .lp-scroll-hint', {
        y: 40,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.5,
      })

      gsap.from('.lp-bust', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.from('.lp-bd-card', {
        scrollTrigger: { trigger: '.lp-bento-dash-grid', start: 'top 82%', once: true },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
      })

      gsap.utils.toArray('.lp-nr-label, .lp-nr-heading, .lp-nr-body').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 28,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        })
      })

      ScrollTrigger.create({
        trigger: patternRef.current,
        start: 'top 72%',
        once: true,
        onEnter: () => setDotResolved(true),
      })

      gsap.from('.lp-final-heading, .lp-final-sub, .lp-final-actions', {
        scrollTrigger: { trigger: '.lp-final-cta', start: 'top 85%', once: true },
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [])

  const handleNavigate = (view) => {
    if (typeof onNavigate === 'function') {
      if (view === 'module1') {
        onStart?.()
        return
      }
      onNavigate(view)
      return
    }

    if (view === 'module1') {
      onStart?.()
    }
  }

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lp-page">
      <section className="lp-hero">
        <h1 className="lp-hero-bg-text" aria-hidden="true">
          Brain &times; AI 101
        </h1>

        <span className="lp-hero-tag lp-hero-tag--left">Brains and AI</span>
        <span className="lp-hero-tag lp-hero-tag--right">Interactive Learning Platform</span>

        <div className="lp-hero-center">
          <img
            src={import.meta.env.BASE_URL + 'images/bust.png'}
            alt="Human profile silhouette"
            className="lp-bust"
          />
        </div>

        <div className="lp-flank-left">
          <p className="lp-flank-label">
            A hands-on journey from biological neurons to modern AI
          </p>
          <button className="lp-btn-text" onClick={scrollToModules}>
            View the modules <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>

        <div className="lp-flank-right">
          <span className="lp-flank-stat">86B</span>
          <p className="lp-flank-stat-label">neurons in the<br />human brain</p>
        </div>

        <div className="lp-hero-bottom">
          <div className="lp-hero-meta">
            <span className="lp-meta-chip">1 hour</span>
            <span className="lp-meta-chip">3 interactive labs</span>
            <span className="lp-meta-chip">Three interactive modules</span>
          </div>
          <button className="lp-btn-primary" onClick={onStart}>
            Start the experience <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>

        <div className="lp-scroll-hint">
          <span className="lp-scroll-line" />
          <span className="lp-scroll-text">Scroll Down</span>
        </div>

        <h1 className="sr-only">Brain &times; AI 101 - interactive course</h1>
      </section>

      <section className="lp-bento-dash" ref={modulesRef}>
        <div className="lp-bento-dash-grid">
          <div className="lp-bd-left">
            <div className="lp-bd-card lp-bd-course-info">
              <p className="lp-bd-overline">Interactive Course</p>
              <h2 className="lp-bd-headline">Three modules.<br />One learning path.</h2>
              <p className="lp-bd-sub">
                Start with biological neurons, move to artificial networks, then see how feedback helps systems learn.
              </p>
              <button className="lp-btn-primary lp-btn-primary--sm" onClick={scrollToModules}>
                View the modules <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>

            <div className="lp-bd-card lp-bd-modules">
              <div className="lp-bd-mod-tabs">
                <button className="lp-bd-tab lp-bd-tab--active" onClick={() => handleNavigate('module1')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--blue" />
                  Neurons
                </button>
                <button className="lp-bd-tab" onClick={() => handleNavigate('module2')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--purple" />
                  Perception
                </button>
                <button className="lp-bd-tab" onClick={() => handleNavigate('module3')}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--green" />
                  Learning
                </button>
              </div>
              <p className="lp-bd-mod-desc">
                See how neurons handle signals, how networks detect patterns, and how feedback changes connections over time.
              </p>
            </div>
          </div>

          <div className="lp-bd-center">
            <div className="lp-bd-card lp-bd-neuron-card">
              <div className="lp-bd-neuron-canvas">
                <Suspense fallback={<div className="lp-canvas-fallback" />}>
                  <NeuronShowcase />
                </Suspense>
              </div>
              <div className="lp-bd-neuron-caption">
                <p className="lp-bd-caption-text">See how a neuron works</p>
                <p className="lp-bd-caption-sub">Interactive 3D neuron model</p>
              </div>
            </div>
          </div>

          <div className="lp-bd-right">
            <div className="lp-bd-card lp-bd-stats-card">
              <p className="lp-bd-overline">By the numbers</p>
              <span className="lp-bd-big-stat">86B</span>
              <p className="lp-bd-stat-label">neurons in the human brain</p>
              <div className="lp-bd-stat-bar-group">
                {[
                  { label: 'Neurons', pct: 85, color: '#2D7EFF' },
                  { label: 'Synapses', pct: 100, color: '#7C3AED' },
                  { label: 'Reflexes', pct: 40, color: '#10B981' },
                ].map((b) => (
                  <div key={b.label} className="lp-bd-bar-row">
                    <span className="lp-bd-bar-label">{b.label}</span>
                    <div className="lp-bd-bar-track">
                      <div className="lp-bd-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-bd-card lp-bd-schedule">
              <p className="lp-bd-overline">Course modules</p>
              {COURSE_MODULES.map((m) => (
                <button key={m.mod} className="lp-bd-sched-row" onClick={() => handleNavigate(m.key)}>
                  <span className="lp-bd-sched-dot" style={{ background: m.color }} />
                  <span className="lp-bd-sched-info">
                    <span className="lp-bd-sched-mod">{m.mod}</span>
                    <span className="lp-bd-sched-label">{m.label}</span>
                  </span>
                  <span className="lp-bd-sched-time">{m.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-bd-bottom">
          <h2 className="lp-bd-bottom-headline">
            Build the idea<br />step by <span className="lp-hero-accent">step</span>
          </h2>
          <button className="lp-btn-primary" onClick={onStart}>
            Begin Module 1 <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
          </button>
        </div>
      </section>

      <section className="lp-narrative">
        <div className="lp-narrative-inner">
          <div className="lp-nr-row">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">Module 1 - Neuron fundamentals</p>
              <h2 className="lp-nr-heading">Every thought starts<br />with a single cell</h2>
              <p className="lp-nr-body">
                See how a biological neuron receives signals, combines inputs, reaches a threshold, and fires. Artificial neurons use a similar idea later in the course.
              </p>
              <div className="lp-nr-bigstats">
                <div className="lp-bigstat">
                  <span className="lp-bigstat-value">86B</span>
                  <span className="lp-bigstat-label">neurons in your brain</span>
                </div>
                <div className="lp-bigstat">
                  <span className="lp-bigstat-value">100T</span>
                  <span className="lp-bigstat-label">synaptic connections</span>
                </div>
              </div>
            </div>
            <div className="lp-nr-visual">
              <div className="lp-anatomy-card">
                <p className="lp-anatomy-heading">How a neuron processes signals</p>
                <div className="lp-anatomy-steps">
                  {ANATOMY_STEPS.map((step) => (
                    <div key={step.label} className={`lp-anatomy-step lp-anatomy-step--${step.color}`}>
                      <span className="lp-anatomy-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lp-nr-row lp-nr-row--reverse">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">Module 2 - Perception and patterns</p>
              <h2 className="lp-nr-heading">Vision isn't brightness.<br />It's pattern.</h2>
              <p className="lp-nr-body">
                See how artificial neurons use weights, layers, and filters to recognize edges, shapes, and patterns in images.
              </p>
              <button className="lp-btn-secondary" onClick={() => handleNavigate('module2')}>
                Explore Module 2 <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>
            <div className="lp-nr-visual" ref={patternRef}>
              <div className="lp-dot-visual">
                <p className="lp-dot-status">
                  {dotResolved ? 'Pattern detected' : 'Analyzing signal...'}
                </p>
                <DotGrid resolved={dotResolved} />
                <p className="lp-dot-caption">
                  {dotResolved ? 'Edge pattern response' : 'Raw pixel activity'}
                </p>
              </div>
            </div>
          </div>

          <div className="lp-nr-row">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">Module 3 - Learning Through Feedback</p>
              <h2 className="lp-nr-heading">Learning happens<br />through feedback.</h2>
              <p className="lp-nr-body">
                See how brains and AI systems use feedback, errors, and changing connections to improve over time.
              </p>
              <p className="lp-nr-body">
                After signals and patterns, the final module shows how learning happens. Students see how feedback helps brains adjust connections and helps AI update weights through backpropagation.
              </p>
              <button className="lp-btn-secondary" onClick={() => handleNavigate('module3')}>
                Explore Module 3 <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
              </button>
            </div>
            <div className="lp-nr-visual">
              <div className="lp-anatomy-card">
                <p className="lp-anatomy-heading">How learning improves a system</p>
                <div className="lp-anatomy-steps">
                  <div className="lp-anatomy-step lp-anatomy-step--blue">
                    <span className="lp-anatomy-label">Signals produce an output</span>
                  </div>
                  <div className="lp-anatomy-step lp-anatomy-step--amber">
                    <span className="lp-anatomy-label">Feedback shows what was right or wrong</span>
                  </div>
                  <div className="lp-anatomy-step lp-anatomy-step--green">
                    <span className="lp-anatomy-label">Connections change so the next response improves</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-final-cta">
        <div className="lp-final-inner">
          <h2 className="lp-final-heading">
            Start with the neuron.<br />Build toward <span className="lp-hero-accent">learning.</span>
          </h2>
          <p className="lp-final-sub">
            One hour. Three modules. The course moves from signal flow, to pattern recognition, to feedback-driven improvement.
          </p>
          <div className="lp-final-actions">
            <button className="lp-btn-primary lp-btn-primary--xl" onClick={onStart}>
              Begin Module 1 <span className="lp-btn-arrow" aria-hidden="true">{'->'}</span>
            </button>

          </div>
        </div>
      </section>
    </div>
  )
}
