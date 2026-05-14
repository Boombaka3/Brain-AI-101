import { useState } from 'react'

const learningExample = {
  inputLabel: 'Handwritten digit',
  target: '3',
  wrongPrediction: '8',
  before: {
    prediction: '8',
    confidenceTarget: 41,
    confidenceWrong: 59,
    error: 0.59,
    weights: [
      { label: 'Upper curve', before: 0.32, after: 0.47 },
      { label: 'Closed loop', before: 0.51, after: 0.34 },
      { label: 'Open gap', before: 0.21, after: 0.39 },
      { label: 'Lower curve', before: 0.44, after: 0.52 },
    ],
  },
  after: {
    prediction: '3',
    confidenceTarget: 74,
    confidenceWrong: 26,
    error: 0.26,
  },
}

const processSteps = [
  'Input',
  'Prediction',
  'Target',
  'Error',
  'Weight Update',
  'Improved Prediction',
]

const controlSteps = [
  'Show Input',
  'Run Prediction',
  'Reveal Target',
  'Measure Error',
  'Update Weights',
  'Test Again',
]

function WeightBar({ value, isAfter = false }) {
  return (
    <div
      aria-hidden="true"
      style={{
        background: '#e2e8f0',
        borderRadius: '999px',
        height: '10px',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          background: isAfter ? 'linear-gradient(90deg, #2563eb, #60a5fa)' : 'linear-gradient(90deg, #10b981, #34d399)',
          borderRadius: '999px',
          height: '100%',
          width: `${Math.max(0, Math.min(100, value * 100))}%`,
        }}
      />
    </div>
  )
}

function LearningProblem() {
  const [step, setStep] = useState(0)

  const showPrediction = step >= 1
  const showTarget = step >= 2
  const showError = step >= 3
  const showWeightUpdate = step >= 4
  const showImprovedPrediction = step >= 5
  const isComplete = step === 5
  const primaryLabel = controlSteps[step]

  const handleAdvance = () => {
    setStep((currentStep) => Math.min(currentStep + 1, 5))
  }

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">A. LEARNING MEANS CHANGING</p>
        <h2>Can the model correct itself?</h2>
        <p className="m3-section-subtitle">
          A learning system improves by using error to change its weights.
        </p>
      </div>

      <div className="m3-section-card m3-signal-activity">
        <div
          className="m3-signal-activity__process"
          aria-label="Learning process"
          role="list"
        >
          {processSteps.map((label, index) => {
            const isCurrent = step === index
            const isComplete = step > index

            return (
              <div
                key={label}
                className={`m3-signal-activity__process-step${isCurrent ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
                style={isCurrent ? { borderWidth: '2px' } : undefined}
              >
                <span className="m3-signal-activity__process-number">
                  {index + 1}
                </span>
                <span className="m3-signal-activity__process-copy">
                  <strong style={isCurrent ? { fontWeight: 800 } : undefined}>{label}</strong>
                  <span>{isCurrent ? 'Current step' : isComplete ? 'Done' : 'Next step'}</span>
                </span>
                {index < processSteps.length - 1 ? (
                  <span
                    className="m3-signal-activity__process-arrow"
                    aria-hidden="true"
                  >
                    {'\u2192'}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="m3-controls m3-signal-activity__controls">
          {!isComplete ? (
            <button
              type="button"
              className="m3-btn m3-btn--primary"
              onClick={handleAdvance}
            >
              {primaryLabel}
            </button>
          ) : null}
          {isComplete ? (
            <>
              <button
                type="button"
                className="m3-btn m3-btn--primary"
                onClick={() => setStep(0)}
              >
                {primaryLabel}
              </button>
              <button
                type="button"
                className="m3-btn"
                onClick={() => setStep(0)}
              >
                Reset
              </button>
            </>
          ) : null}
        </div>

        <div className="m3-signal-activity__grid">
          <article className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <p className="m3-learning-label">Column 1</p>
              <h3>Input</h3>
            </div>

            <div
              style={{
                alignItems: 'center',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                border: '1px solid #dbe5f0',
                borderRadius: '18px',
                display: 'grid',
                justifyItems: 'center',
                minHeight: '220px',
                padding: '18px',
              }}
            >
              {step >= 0 ? (
                <div
                  aria-label="Handwritten digit 3"
                  style={{
                    color: '#1e3a8a',
                    fontFamily: '"Brush Script MT", "Segoe Script", cursive',
                    fontSize: '7rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    transform: 'rotate(-9deg)',
                  }}
                >
                  3
                </div>
              ) : null}
            </div>

            <p className="m3-section-subtitle" style={{ margin: 0, maxWidth: 'none', textAlign: 'left' }}>
              {step >= 0 ? `The model receives an input: a ${learningExample.inputLabel.toLowerCase()}.` : ''}
            </p>
          </article>

          <article className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <p className="m3-learning-label">Column 2</p>
              <h3>Prediction, Target, Error</h3>
            </div>

            <div className="m3-signal-activity__phase">
              <div className="m3-signal-activity__info-list">
                <div className="m3-signal-activity__info-item">
                  <span>Prediction</span>
                  <strong>{showPrediction ? learningExample.before.prediction : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Target</span>
                  <strong>{showTarget ? learningExample.target : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Error</span>
                  <strong>{showError ? learningExample.before.error.toFixed(2) : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Confidence in target answer</span>
                  <strong>{showError ? `${learningExample.before.confidenceTarget}%` : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Confidence in wrong answer</span>
                  <strong>{showError ? `${learningExample.before.confidenceWrong}%` : '...'}</strong>
                </div>
              </div>
            </div>

            <div className="m3-signal-activity__phase">
              <p className="m3-signal-activity__phase-label">After learning</p>
              <div className="m3-signal-activity__info-list">
                <div className="m3-signal-activity__info-item">
                  <span>Prediction after update</span>
                  <strong>{showImprovedPrediction ? learningExample.after.prediction : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Target</span>
                  <strong>{showImprovedPrediction ? learningExample.target : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Error after update</span>
                  <strong>{showImprovedPrediction ? learningExample.after.error.toFixed(2) : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Confidence in target answer</span>
                  <strong>{showImprovedPrediction ? `${learningExample.after.confidenceTarget}%` : '...'}</strong>
                </div>
                <div className="m3-signal-activity__info-item">
                  <span>Confidence in wrong answer</span>
                  <strong>{showImprovedPrediction ? `${learningExample.after.confidenceWrong}%` : '...'}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <p className="m3-learning-label">Column 3</p>
              <h3>Weights</h3>
            </div>

            <div className="m3-signal-activity__phase">
              <div className="m3-signal-activity__info-list">
                {learningExample.before.weights.map((weight) => (
                  <div
                    key={weight.label}
                    className="m3-signal-activity__info-item"
                    style={{ alignItems: 'stretch', display: 'grid', gap: '8px' }}
                  >
                    <div style={{ alignItems: 'center', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                      <span>{weight.label}</span>
                      <strong>
                        {showWeightUpdate
                          ? `${weight.before.toFixed(2)} \u2192 ${weight.after.toFixed(2)}`
                          : weight.before.toFixed(2)}
                      </strong>
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      <WeightBar value={weight.before} />
                      {showWeightUpdate ? <WeightBar value={weight.after} isAfter /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {showImprovedPrediction ? (
          <div
            className="m3-signal-activity__phase"
            style={{
              background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
              borderColor: '#bfdbfe',
            }}
          >
            <p className="m3-signal-activity__phase-label">Final takeaway</p>
            <div style={{ display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>
                Learning happened because the model changed its weights.
              </p>
              <p style={{ margin: 0 }}>The input stayed the same.</p>
              <p style={{ margin: 0 }}>The target stayed the same.</p>
              <p style={{ margin: 0 }}>The error provided feedback.</p>
              <p style={{ margin: 0 }}>The weights changed.</p>
              <p style={{ margin: 0 }}>The next prediction improved.</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="m3-section-card">
        <div className="m3-mechanism-panel__header">
          <p className="m3-learning-label">Biology bridge</p>
          <h3>Same idea, different system</h3>
        </div>
        <p className="m3-section-subtitle" style={{ margin: 0, maxWidth: 'none', textAlign: 'left' }}>
          Brains also change through experience. Synaptic plasticity means connections between neurons can strengthen or weaken over time. In machine learning, weights between artificial neurons also increase or decrease during training. The mechanisms are different, but the shared idea is adaptive connection strength.
        </p>
      </div>
    </section>
  )
}

export default LearningProblem
