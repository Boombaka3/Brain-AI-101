import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GuidedAnatomyOverlay from './GuidedAnatomyOverlay'

function Module1Intro({ onStart }) {
  const [tourComplete, setTourComplete] = useState(false)

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
        <AnimatePresence mode="wait">
          {!tourComplete ? (
            <motion.div
              key="tour"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <GuidedAnatomyOverlay onComplete={() => setTourComplete(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              className="module1-intro-ready"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="module1-intro-ready-card">
                <h3 className="module1-intro-ready-title">
                  You've met the parts.
                </h3>
                <p className="module1-intro-ready-desc">
                  Dendrites receive. Soma adds. Axon carries. Terminals pass it on.
                  Now let's put a neuron to work and see if it fires.
                </p>
                <button className="module1-intro-cta" onClick={onStart}>
                  Start the experiment
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
          )}
        </AnimatePresence>
      </div>

      <div className="module1-intro-orb" aria-hidden="true" />
    </section>
  )
}

export default Module1Intro
