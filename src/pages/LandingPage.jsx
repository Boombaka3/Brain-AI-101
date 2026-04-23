import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/shared.css'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

const BrainParticleField = lazy(() => import('../components/three/BrainParticleField'))
const NeuronShowcase = lazy(() => import('../components/three/NeuronShowcase'))

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
  0.9,  0.9,  0.9, 0.9,  0.9,
  0.05, 0.05, 0.9, 0.05, 0.05,
  0.05, 0.05, 0.9, 0.05, 0.05,
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

const ANATOMY_STEPS = [
  { icon: '📡', label: 'Dendrites receive', color: 'blue' },
  { icon: '⚖️', label: 'Soma integrates', color: 'green' },
  { icon: '⚡', label: 'Threshold fires', color: 'amber' },
  { icon: '⟶', label: 'Axon propagates', color: 'purple' },
]

export default function LandingPage({ onStart }) {
  const patternRef = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [dotResolved, setDotResolved] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lp-hero-bg-text', {
        opacity: 0, scale: 0.92, duration: 1.4, ease: 'power3.out', delay: 0.1,
      })

      gsap.from(
        '.lp-flank-left, .lp-flank-right, .lp-hero-bottom, .lp-scroll-hint',
        { y: 40, opacity: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out', delay: 0.5 },
      )

      gsap.from('.lp-bust', {
        y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2,
      })

      ScrollTrigger.create({
        trigger: '.lp-hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => setScrollProgress(self.progress),
      })

      gsap.from('.lp-bd-card', {
        scrollTrigger: { trigger: '.lp-bento-dash-grid', start: 'top 82%', once: true },
        y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      })

      gsap.utils.toArray('.lp-nr-label, .lp-nr-heading, .lp-nr-body').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 28, opacity: 0, duration: 0.65, ease: 'power2.out',
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
        y: 28, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="lp-page">

      {/* ── Hero ── */}
      <section className="lp-hero">
        {/* Headline BEHIND the bust */}
        <h1 className="lp-hero-bg-text" aria-hidden="true">
          How Does<br />a Brain Learn?
        </h1>

        {/* Small flanking labels beside the headline */}
        <span className="lp-hero-tag lp-hero-tag--left">Neuroscience × AI</span>
        <span className="lp-hero-tag lp-hero-tag--right">Interactive Learning Platform</span>

        {/* Centered bust + brain overlay — IN FRONT of headline */}
        <div className="lp-hero-center">
          <img
            src={import.meta.env.BASE_URL + 'images/bust.png'}
            alt="Human profile silhouette"
            className="lp-bust"
          />
          <div className="lp-hero-canvas-wrap">
            <Suspense fallback={<div className="lp-canvas-fallback" />}>
              <BrainParticleField scrollProgress={scrollProgress} />
            </Suspense>
          </div>
        </div>

        {/* Lower-left info block */}
        <div className="lp-flank-left">
          <p className="lp-flank-label">A hands-on journey from<br />biological neurons to modern AI</p>
          <button className="lp-btn-text" onClick={onStart}>
            Learn more <span className="lp-btn-arrow">→</span>
          </button>
        </div>

        {/* Lower-right stat */}
        <div className="lp-flank-right">
          <span className="lp-flank-stat">86B</span>
          <p className="lp-flank-stat-label">neurons in the<br />human brain</p>
        </div>

        {/* Bottom CTA */}
        <div className="lp-hero-bottom">
          <div className="lp-hero-meta">
            <span className="lp-meta-chip">1 hour</span>
            <span className="lp-meta-chip">3 interactive labs</span>
            <span className="lp-meta-chip">Built for curious minds</span>
          </div>
          <button className="lp-btn-primary" onClick={onStart}>
            Start the experience <span className="lp-btn-arrow">→</span>
          </button>
        </div>

        <div className="lp-scroll-hint">
          <span className="lp-scroll-line" />
          <span className="lp-scroll-text">Scroll Down</span>
        </div>

        {/* Accessible headline for screen readers */}
        <h1 className="sr-only">How Does a Brain Learn? — Brain-AI-101 Interactive Course</h1>
      </section>

      {/* ── Bento dashboard section ── */}
      <section className="lp-bento-dash">
        <div className="lp-bento-dash-grid">

          {/* Left column */}
          <div className="lp-bd-left">
            <div className="lp-bd-card lp-bd-course-info">
              <p className="lp-bd-overline">Interactive Course</p>
              <h2 className="lp-bd-headline">Three modules.<br />One complete picture.</h2>
              <p className="lp-bd-sub">From biological neurons to modern AI — built for curious minds.</p>
              <button className="lp-btn-primary lp-btn-primary--sm" onClick={onStart}>
                Try for free <span className="lp-btn-arrow">→</span>
              </button>
            </div>

            <div className="lp-bd-card lp-bd-modules">
              <div className="lp-bd-mod-tabs">
                <button className="lp-bd-tab lp-bd-tab--active" onClick={onStart}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--blue" />Neurons
                </button>
                <button className="lp-bd-tab" onClick={onStart}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--purple" />Perception
                </button>
                <button className="lp-bd-tab" onClick={onStart}>
                  <span className="lp-bd-tab-dot lp-bd-tab-dot--green" />Learning
                </button>
              </div>
              <p className="lp-bd-mod-desc">Adjust real inputs, set thresholds, and watch neurons fire across 6 scenarios.</p>
            </div>
          </div>

          {/* Center — tall 3D neuron */}
          <div className="lp-bd-center">
            <div className="lp-bd-card lp-bd-neuron-card">
              <div className="lp-bd-neuron-canvas">
                <Suspense fallback={<div className="lp-canvas-fallback" />}>
                  <NeuronShowcase />
                </Suspense>
              </div>
              <div className="lp-bd-neuron-caption">
                <p className="lp-bd-caption-text">Explore the building block of intelligence</p>
                <p className="lp-bd-caption-sub">Interactive 3D neuron model</p>
              </div>
            </div>
          </div>

          {/* Right column */}
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
              {[
                { mod: 'Module 1', label: 'Meet the Neuron', time: '~12 min', color: '#2D7EFF' },
                { mod: 'Module 2', label: 'Perception & Patterns', time: '~22 min', color: '#7C3AED' },
                { mod: 'Module 3', label: 'Learning to Learn', time: '~26 min', color: '#10B981' },
              ].map((m) => (
                <button key={m.mod} className="lp-bd-sched-row" onClick={onStart}>
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

        {/* Bottom headline */}
        <div className="lp-bd-bottom">
          <h2 className="lp-bd-bottom-headline">
            The perfect place<br />to build your <span className="lp-hero-accent">intuition</span>
          </h2>
          <button className="lp-btn-primary" onClick={onStart}>
            Start learning <span className="lp-btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── Narrative sections ── */}
      <section className="lp-narrative">
        <div className="lp-narrative-inner">
          <div className="lp-nr-row">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">Module 1 · Neuron fundamentals</p>
              <h2 className="lp-nr-heading">Every thought starts<br />with a single cell</h2>
              <p className="lp-nr-body">
                Neurons receive signals from many paths simultaneously, weigh them by connection strength, and decide whether to fire — a process almost identical to how artificial neural networks compute.
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
                      <span className="lp-anatomy-icon">{step.icon}</span>
                      <span className="lp-anatomy-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lp-nr-row lp-nr-row--reverse">
            <div className="lp-nr-text">
              <p className="lp-nr-label lp-section-label">Module 2 · Perception &amp; patterns</p>
              <h2 className="lp-nr-heading">Vision isn't brightness.<br />It's pattern.</h2>
              <p className="lp-nr-body">
                Two inputs with the same total sum can mean completely different things when their spatial arrangement differs. Discover how groups of neurons detect edges, shapes, and features.
              </p>
              <button className="lp-btn-secondary" onClick={onStart}>Explore Module 2 →</button>
            </div>
            <div className="lp-nr-visual" ref={patternRef}>
              <div className="lp-dot-visual">
                <p className="lp-dot-status">
                  {dotResolved ? '✓ Pattern detected' : 'Analysing signal...'}
                </p>
                <DotGrid resolved={dotResolved} />
                <p className="lp-dot-caption">
                  {dotResolved ? 'Cross-edge kernel response' : 'Raw pixel activations'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final-cta">
        <div className="lp-final-inner">
          <h2 className="lp-final-heading">
            Ready to understand<br /><span className="lp-hero-accent">intelligence?</span>
          </h2>
          <p className="lp-final-sub">
            One hour. Three modules. Your own intuition for how AI works — built from neurons up.
          </p>
          <div className="lp-final-actions">
            <button className="lp-btn-primary lp-btn-primary--xl" onClick={onStart}>
              Begin Module 1 →
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
