import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/shared.css'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

const NeuronOrb3D = lazy(() => import('../components/three/NeuronOrb3D'))

const MODULE_DATA = [
  {
    number: 'Module 1',
    icon: '🧠',
    name: 'Meet the Neuron',
    desc: 'Explore the biological building block of intelligence — how dendrites receive, soma integrates, and axons fire.',
    time: '~12 min',
  },
  {
    number: 'Module 2',
    icon: '👁️',
    name: 'Perception & Response',
    desc: 'Discover why spatial patterns matter, how multiple neurons cooperate, and what convolution really means.',
    time: '~22 min',
  },
  {
    number: 'Module 3',
    icon: '⚡',
    name: 'Learning to Learn',
    desc: 'Understand the feedback loops that turn fixed connections into adaptive intelligence — from synapses to backprop.',
    time: '~26 min',
  },
]

// 5×5 dot grid — two states: noise → edge pattern
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
    <div className="landing-dot-grid">
      {pattern.map((v, i) => (
        <div
          key={i}
          className={`landing-dot${v > 0.5 ? ' active' : ''}`}
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

export default function LandingPage({ onStart }) {
  const heroTextRef = useRef()
  const narrativeRef = useRef()
  const patternRef = useRef()
  const roadmapRef = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [dotResolved, setDotResolved] = useState(false)

  useEffect(() => {
    // Hero text entrance
    const ctx = gsap.context(() => {
      gsap.from('.landing-eyebrow, .landing-headline, .landing-subhead, .landing-meta-row, .landing-hero-cta, .landing-scroll-hint', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      })

      // Scroll progress for orb
      ScrollTrigger.create({
        trigger: '.landing-hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => setScrollProgress(self.progress),
      })

      // Narrative sections reveal
      gsap.utils.toArray('.landing-narrative-label, .landing-narrative-heading, .landing-narrative-body, .landing-stat-row').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
        })
      })

      // Dot grid — resolve on scroll into view
      ScrollTrigger.create({
        trigger: patternRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => setDotResolved(true),
      })

      // Module cards stagger
      gsap.from('.landing-module-card', {
        scrollTrigger: { trigger: '.landing-module-cards', start: 'top 80%', once: true },
        y: 32,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
      })

      gsap.from('.landing-roadmap-heading, .landing-roadmap-sub, .landing-cta-row', {
        scrollTrigger: { trigger: '.landing-roadmap-heading', start: 'top 85%', once: true },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="landing-page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-orb">
          <Suspense fallback={
            <div style={{
              width: '100%', height: 420, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, #dbeafe, #eff6ff)',
              margin: '0 auto',
            }} />
          }>
            <NeuronOrb3D scrollProgress={scrollProgress} height={420} />
          </Suspense>
        </div>

        <div className="landing-hero-text" ref={heroTextRef}>
          <p className="landing-eyebrow">Interactive Neuroscience + AI</p>
          <h1 className="landing-headline">
            How Does a<br /><em>Brain Learn?</em>
          </h1>
          <p className="landing-subhead">
            A hands-on journey from biological neurons to artificial intelligence — no maths required.
          </p>
          <div className="landing-meta-row">
            <span className="landing-meta-pill">⏱ 1 hour</span>
            <span className="landing-meta-pill">🧪 3 labs</span>
            <span className="landing-meta-pill">🎯 Interactive</span>
          </div>
          <button className="shared-btn shared-btn-primary landing-hero-cta" onClick={onStart}>
            Start the experience →
          </button>
          <p className="landing-scroll-hint">↓ Scroll to explore</p>
        </div>
      </section>

      {/* ── Narrative 1: The Neuron ───────────────────────────────── */}
      <section className="landing-narrative" ref={narrativeRef}>
        <div className="landing-narrative-grid">
          <div>
            <p className="landing-narrative-label">Module 1 · Neuron fundamentals</p>
            <h2 className="landing-narrative-heading">Every thought starts with a single cell</h2>
            <p className="landing-narrative-body">
              Neurons are the atoms of intelligence. Each one receives signals, weighs them, and decides
              whether to fire — a process almost identical to how AI nodes compute. Understanding one
              neuron unlocks everything that follows.
            </p>
            <div className="landing-stat-row">
              <div className="landing-stat">
                <span className="landing-stat-value">86B</span>
                <span className="landing-stat-label">neurons in the human brain</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-value">100T</span>
                <span className="landing-stat-label">synaptic connections</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: 24,
              padding: '32px',
              width: '100%',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Dendrites receive', icon: '📡', color: '#dbeafe', border: '#93c5fd' },
                  { label: 'Soma integrates', icon: '⚖️', color: '#f0fdf4', border: '#86efac' },
                  { label: 'Threshold fires', icon: '⚡', color: '#fff7ed', border: '#fdba74' },
                  { label: 'Axon propagates', icon: '→', color: '#f5f3ff', border: '#c4b5fd' },
                ].map((step) => (
                  <div key={step.label} style={{
                    alignItems: 'center', background: step.color, border: `1px solid ${step.border}`,
                    borderRadius: 12, display: 'flex', gap: 12, padding: '12px 16px',
                  }}>
                    <span style={{ fontSize: 18 }}>{step.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Narrative 2: Pattern ─────────────────────────────────── */}
      <section className="landing-narrative" style={{ paddingTop: 0 }}>
        <div className="landing-narrative-grid reverse">
          <div>
            <p className="landing-narrative-label">Module 2 · Perception & patterns</p>
            <h2 className="landing-narrative-heading">Vision isn't brightness. It's pattern.</h2>
            <p className="landing-narrative-body">
              Two inputs with the same sum can mean completely different things spatially.
              Discover how groups of neurons detect edges, shapes, and features — and how
              this is exactly what convolutional neural networks do.
            </p>
            <button className="shared-btn shared-btn-secondary" onClick={onStart}>
              Explore Module 2 →
            </button>
          </div>
          <div ref={patternRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              {dotResolved ? '✓ Pattern detected' : 'Analysing signal...'}
            </p>
            <DotGrid resolved={dotResolved} />
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
              {dotResolved ? 'Cross-edge kernel response' : 'Raw pixel activations'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Narrative 3: Learning ────────────────────────────────── */}
      <section className="landing-narrative" style={{ paddingTop: 0 }}>
        <div className="landing-narrative-grid">
          <div>
            <p className="landing-narrative-label">Module 3 · Learning mechanisms</p>
            <h2 className="landing-narrative-heading">Intelligence is what changes when you're wrong.</h2>
            <p className="landing-narrative-body">
              Supervised learning, reinforcement learning, and context-based inference — all three
              reduce to one idea: feedback changes connections. Watch a network learn in real time,
              then see how this bridges to modern deep learning.
            </p>
            <button className="shared-btn shared-btn-secondary" onClick={onStart}>
              Explore Module 3 →
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Simplified loss curve illustration */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px 24px',
              width: '100%',
            }}>
              <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Training loss over time
              </p>
              <svg width="100%" viewBox="0 0 240 100" fill="none">
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M10,10 C40,10 50,30 70,50 C90,68 110,78 140,82 C165,85 190,87 230,88" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M10,10 C40,10 50,30 70,50 C90,68 110,78 140,82 C165,85 190,87 230,88 L230,100 L10,100 Z" fill="url(#lossGrad)" />
                <text x="10" y="97" fill="#94a3b8" fontSize="9">Step 0</text>
                <text x="195" y="97" fill="#94a3b8" fontSize="9">Step 100</text>
                <text x="6" y="14" fill="#94a3b8" fontSize="9">High</text>
                <text x="6" y="92" fill="#10b981" fontSize="9">Low ✓</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Module Roadmap ───────────────────────────────────────── */}
      <section className="landing-roadmap" ref={roadmapRef}>
        <div className="landing-roadmap-inner">
          <h2 className="landing-roadmap-heading">Your 1-hour learning path</h2>
          <p className="landing-roadmap-sub">
            Three self-contained modules. Explore them in order or jump to any topic.
          </p>

          <div className="landing-module-cards">
            {MODULE_DATA.map((mod, i) => (
              <button
                key={mod.number}
                className="landing-module-card"
                onClick={onStart}
                style={{ border: 'none', background: 'rgba(255,255,255,0.88)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
              >
                <div className="landing-module-icon">{mod.icon}</div>
                <div>
                  <p className="landing-module-number">{mod.number}</p>
                  <h3 className="landing-module-name">{mod.name}</h3>
                  <p className="landing-module-desc">{mod.desc}</p>
                </div>
                <div className="landing-module-footer">
                  <span className="shared-time-pill">{mod.time}</span>
                  <span style={{ color: '#2563eb', fontSize: 13, fontWeight: 600 }}>Start →</span>
                </div>
              </button>
            ))}
          </div>

          <div className="landing-cta-row">
            <button className="shared-btn shared-btn-primary landing-hero-cta" onClick={onStart}>
              Begin Module 1 →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
