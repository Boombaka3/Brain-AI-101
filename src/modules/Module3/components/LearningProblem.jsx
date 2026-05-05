import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const INPUTS = [
  { id: 'x1', label: 'Input x1 = 1', value: 1 },
  { id: 'x2', label: 'Input x2 = 0', value: 0 },
  { id: 'x3', label: 'Input x3 = 1', value: 1 },
]

const BEFORE = [0.4, 0.7, 0.2]
const AFTER = [0.3, 0.7, 0.1]
const STAGES = ['Start', 'Predict', 'Compare', 'Update', 'Result']

function LearningProblem() {
  const [step, setStep] = useState(0)
  const pulseRef = useRef(null)

  useEffect(() => {
    if (!pulseRef.current) {
      return
    }

    gsap.fromTo(
      pulseRef.current,
      { y: 8, opacity: 0.7 },
      { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' },
    )
  }, [step])

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">A. FIXED VS LEARNING</p>
        <h2>From Fixed Weights to Learning Weights</h2>
        <p className="m3-section-subtitle">
          Watch how feedback changes weights.
        </p>
      </div>

      <div className="m3-section-card m3-mechanism-card">
        <div className="m3-mechanism-steps">
          {STAGES.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`m3-step-chip${step === index ? ' is-active' : ''}${step > index ? ' is-complete' : ''}`}
              onClick={() => setStep(index)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="m3-fixed-learning-grid">
          <div className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <p className="m3-learning-label">Example</p>
              <h3>A tiny model makes a prediction</h3>
            </div>

            <div className="m3-value-grid">
              {INPUTS.map((item, index) => (
                <div
                  key={item.id}
                  className={`m3-value-card${item.value === 1 ? ' is-on' : ''}${step >= 3 && item.value === 1 ? ' is-updating' : ''}`}
                >
                  <span>{item.label}</span>
                  <strong>x{index + 1} = {item.value}</strong>
                </div>
              ))}
            </div>

            <div className="m3-mechanism-table">
              <div className="m3-mechanism-table__row m3-mechanism-table__row--head">
                <span>Input</span>
                <span>Weight</span>
                <span>Update</span>
              </div>
              {INPUTS.map((item, index) => (
                <div key={`${item.id}-weight`} className="m3-mechanism-table__row">
                  <span>x{index + 1}</span>
                  <span>{step >= 3 ? `${BEFORE[index].toFixed(1)} → ${AFTER[index].toFixed(1)}` : BEFORE[index].toFixed(1)}</span>
                  <span className={item.value === 1 && step >= 3 ? 'is-change' : ''}>
                    {step >= 3 ? (item.value === 1 ? 'changed' : 'held') : item.value === 1 ? 'active' : 'off'}
                  </span>
                </div>
              ))}
            </div>

            <div className="m3-formula-strip">
              <span>Before: 1×0.4 + 0×0.7 + 1×0.2 = 0.6</span>
              <span>After: {step >= 4 ? '1×0.3 + 0×0.7 + 1×0.1 = 0.4' : '...'}</span>
            </div>
          </div>

          <div className="m3-mechanism-panel m3-mechanism-panel--feedback" ref={pulseRef}>
            <div className="m3-feedback-stack">
              <div className="m3-feedback-box">
                <span>Prediction</span>
                <strong>{step >= 1 ? (step >= 4 ? '0' : '1') : '...'}</strong>
              </div>
              <div className="m3-feedback-box">
                <span>Target</span>
                <strong>{step >= 2 ? '0' : '...'}</strong>
              </div>
              <div className="m3-feedback-box">
                <span>Error</span>
                <strong>{step >= 2 ? '-1' : '...'}</strong>
              </div>
            </div>

            <div className="m3-before-after">
              <div className="m3-before-after__card">
                <span>Before Update</span>
                <strong>Weights unchanged</strong>
              </div>
              <div className="m3-before-after__arrow">→</div>
              <div className="m3-before-after__card is-good">
                <span>After Update</span>
                <strong>{step >= 4 ? 'Waiting for feedback' : 'Waiting for feedback'}</strong>
              </div>
            </div>

            <div className="m3-mini-callout">
              <strong>Weight Change</strong>
              <span>{step >= 3 ? 'w1: 0.4 → 0.3\nw2: 0.7 → 0.7\nw3: 0.2 → 0.1\nx2 = 0, so w2 does not change.' : 'No update yet.'}</span>
            </div>
          </div>
        </div>

        <div className="m3-controls">
          <button className="m3-btn" onClick={() => setStep(1)}>Show Prediction</button>
          <button className="m3-btn" onClick={() => setStep(2)}>Show Target</button>
          <button className="m3-btn" onClick={() => setStep(3)}>Update Weights</button>
          <button className="m3-btn" onClick={() => setStep(0)}>Reset</button>
        </div>

        <p className="m3-takeaway">Prediction → target → error → weight update.</p>
      </div>
    </section>
  )
}

export default LearningProblem
