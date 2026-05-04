import { motion } from 'framer-motion'
import HearingAttentionScene from './HearingAttentionScene'

function Module1Intro({ onStart }) {
  return (
    <section className="module1-intro-hero">
      <div className="module1-intro-hero-inner">
        <p className="module1-intro-kicker">Module 1</p>
        <h2 className="module1-intro-headline">
          How Does a Neuron
          <br />
          <span className="module1-intro-headline-accent">Decide?</span>
        </h2>
        <p className="module1-intro-desc">
          Right now, millions of neurons are firing in your brain to let you
          read this sentence. Each one makes a single decision: fire or stay
          quiet. Let's zoom in on just one.
        </p>
      </div>

      <div className="module1-intro-tour">
        <motion.div
          key="scene"
          className="module1-intro-scene"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="module1-intro-scene-copy">
            <p className="module1-eyebrow module1-eyebrow-tight">Selective attention</p>
            <p className="module1-card-muted module1-text-reset">
              Hearing your name in a noisy room
            </p>
          </div>
          <HearingAttentionScene />
          <div className="module1-intro-scene-actions">
            <button className="module1-intro-cta" onClick={onStart}>
              Explore neuron parts
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="module1-intro-orb" aria-hidden="true" />
    </section>
  )
}

export default Module1Intro
