import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import neuronDiagram from '../../../assets/vector-diagram-of-neuron-anatomy.svg'
import './guidedAnatomy.css'

const STEPS = [
  {
    id: 'dendrites',
    label: 'Dendrites',
    desc: 'These branches collect incoming signals from other neurons or sensors.',
    x: '12%',
    y: '35%',
    highlightArea: { left: '0%', top: '5%', width: '28%', height: '90%' },
  },
  {
    id: 'soma',
    label: 'Soma',
    desc: 'The decision center — it adds all the incoming signals together.',
    x: '32%',
    y: '48%',
    highlightArea: { left: '22%', top: '20%', width: '22%', height: '55%' },
  },
  {
    id: 'axon',
    label: 'Axon',
    desc: 'If the total is strong enough, the signal travels down this highway.',
    x: '62%',
    y: '50%',
    highlightArea: { left: '42%', top: '35%', width: '35%', height: '35%' },
  },
  {
    id: 'terminals',
    label: 'Terminals',
    desc: 'The signal reaches the end and passes the message to the next neuron.',
    x: '88%',
    y: '45%',
    highlightArea: { left: '80%', top: '20%', width: '20%', height: '70%' },
  },
]

export default function GuidedAnatomyOverlay({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [visited, setVisited] = useState(new Set())
  const isStarted = currentStep >= 0
  const allVisited = visited.size === STEPS.length

  const handleStepClick = (index) => {
    if (index !== currentStep + 1 && !visited.has(index)) return
    setCurrentStep(index)
    setVisited((prev) => new Set([...prev, index]))
  }

  const handleContinue = () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setVisited((prev) => new Set([...prev, next]))
    }
  }

  const handleFinish = () => {
    onComplete?.()
  }

  const activeStep = currentStep >= 0 ? STEPS[currentStep] : null

  return (
    <div className="ga">
      <div className="ga-diagram">
        <img
          className="ga-diagram-img"
          src={neuronDiagram}
          alt="Biological neuron anatomy"
          draggable={false}
        />

        {isStarted && <div className="ga-dim" />}

        {isStarted && activeStep && (
          <motion.div
            key={activeStep.id}
            className="ga-highlight"
            style={activeStep.highlightArea}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {STEPS.map((step, i) => {
          const isActive = currentStep === i
          const isVisited = visited.has(i)
          const isNext = i === currentStep + 1 || (currentStep === -1 && i === 0)

          return (
            <button
              key={step.id}
              className={`ga-hotspot${isActive ? ' ga-hotspot--active' : ''}${isVisited && !isActive ? ' ga-hotspot--visited' : ''}${isNext && !isVisited ? ' ga-hotspot--next' : ''}`}
              style={{ left: step.x, top: step.y }}
              onClick={() => isNext || isVisited ? handleStepClick(i) : null}
              disabled={!isNext && !isVisited}
            >
              <span className="ga-hotspot-ring" />
              {(isActive || isVisited) && (
                <span className="ga-hotspot-label">{step.label}</span>
              )}
              {isNext && !isVisited && (
                <span className="ga-hotspot-pulse" />
              )}
            </button>
          )
        })}
      </div>

      <div className="ga-footer">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="start"
              className="ga-prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="ga-prompt-text">
                Tap the glowing dot to start exploring the neuron's parts.
              </p>
            </motion.div>
          ) : activeStep ? (
            <motion.div
              key={activeStep.id}
              className="ga-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ga-info-header">
                <span className="ga-info-step">
                  {currentStep + 1} / {STEPS.length}
                </span>
                <h3 className="ga-info-title">{activeStep.label}</h3>
              </div>
              <p className="ga-info-desc">{activeStep.desc}</p>
              {allVisited ? (
                <button className="shared-btn shared-btn-primary shared-btn-sm" onClick={handleFinish}>
                  Got it — let's experiment
                </button>
              ) : (
                <button className="shared-btn shared-btn-secondary shared-btn-sm" onClick={handleContinue}>
                  Next part
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="ga-dots">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`ga-dot${currentStep === i ? ' ga-dot--active' : ''}${visited.has(i) ? ' ga-dot--visited' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
