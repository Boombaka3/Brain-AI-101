import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './completionScreen.css'

const MODULES = [
  {
    num: '01',
    title: 'Biological Neuron',
    summary: 'Dendrites collect signals, the soma sums them, and the axon fires when the total crosses a threshold.',
    color: '#2563eb',
    key: 'module1',
  },
  {
    num: '02',
    title: 'Pattern Recognition',
    summary: 'Weights give neurons selectivity. Different weight patterns detect different features — edges, textures, shapes.',
    color: '#7c3aed',
    key: 'module2',
  },
  {
    num: '03',
    title: 'Learning to Learn',
    summary: 'Feedback drives adaptation. Mismatches between prediction and reality push weights toward better guesses.',
    color: '#059669',
    key: 'module3',
  },
]

const NEXT_STEPS = [
  {
    icon: '🧠',
    title: '3Blue1Brown Neural Networks',
    desc: 'Visual deep dive into how neural networks actually learn.',
    url: 'https://www.3blue1brown.com/topics/neural-networks',
  },
  {
    icon: '📘',
    title: 'Neural Networks and Deep Learning',
    desc: 'Free online book by Michael Nielsen — an accessible intro.',
    url: 'http://neuralnetworksanddeeplearning.com/',
  },
  {
    icon: '🎮',
    title: 'TensorFlow Playground',
    desc: 'Tinker with a real neural network right in your browser.',
    url: 'https://playground.tensorflow.org/',
  },
  {
    icon: '🔬',
    title: 'Distill.pub',
    desc: 'Beautiful interactive articles on machine learning concepts.',
    url: 'https://distill.pub/',
  },
]

function CompletionScreen({ onGoToModule, onBackToHome }) {
  const heroRef = useRef(null)
  const cardsRef = useRef(null)
  const nextRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.from(heroRef.current, { y: 30, opacity: 0, duration: 0.6 })
    tl.from(cardsRef.current?.children || [], { y: 20, opacity: 0, duration: 0.4, stagger: 0.12 }, '-=0.2')
    tl.from(nextRef.current, { y: 20, opacity: 0, duration: 0.5 }, '-=0.1')
  }, [])

  return (
    <div className="completion-page">
      <div className="completion-content">
        <div ref={heroRef} className="completion-hero">
          <div className="completion-badge">Course Complete</div>
          <h1 className="completion-headline">You Did It!</h1>
          <p className="completion-subtitle">
            You've journeyed from a single biological neuron all the way to how networks learn.
            That's the foundation of both neuroscience and AI.
          </p>
        </div>

        <section className="completion-recap">
          <h2 className="completion-section-title">What You Learned</h2>
          <div ref={cardsRef} className="completion-module-cards">
            {MODULES.map((mod) => (
              <button
                key={mod.key}
                className="completion-module-card"
                style={{ '--card-accent': mod.color }}
                onClick={() => onGoToModule?.(mod.key)}
              >
                <span className="completion-module-num">{mod.num}</span>
                <h3 className="completion-module-title">{mod.title}</h3>
                <p className="completion-module-summary">{mod.summary}</p>
                <span className="completion-module-revisit">Revisit</span>
              </button>
            ))}
          </div>
        </section>

        <section ref={nextRef} className="completion-next">
          <h2 className="completion-section-title">What's Next?</h2>
          <p className="completion-next-intro">
            Keep exploring — here are some great resources to go deeper.
          </p>
          <div className="completion-next-grid">
            {NEXT_STEPS.map((step, i) => (
              <a
                key={i}
                className="completion-next-card"
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="completion-next-icon">{step.icon}</span>
                <h3 className="completion-next-title">{step.title}</h3>
                <p className="completion-next-desc">{step.desc}</p>
                <span className="completion-next-link">
                  Visit
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="completion-footer">
          <button className="completion-home-btn" onClick={onBackToHome}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l6-6 6 6M4 6.5V13h3v-3h2v3h3V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletionScreen
