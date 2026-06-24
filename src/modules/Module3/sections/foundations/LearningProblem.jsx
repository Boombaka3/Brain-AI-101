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

const controlSteps = [
  'Run Prediction',
  'Reveal Target',
  'Measure Error',
  'Update Weights',
  'Test Again',
]

function LearningProblem() {
  const [step, setStep] = useState(0)

  const showPrediction = step >= 1
  const showTarget = step >= 2
  const showError = step >= 3
  const showWeightUpdate = step >= 4
  const showImprovedPrediction = step >= 4
  const isComplete = step === 4
  const primaryLabel = controlSteps[step]

  const handleAdvance = () => {
    setStep((currentStep) => Math.min(currentStep + 1, 4))
  }

  const strongestWeight = learningExample.before.weights.reduce((strongest, weight) => (
    weight.before > strongest.before ? weight : strongest
  ), learningExample.before.weights[0])

  return (
    <section className="m3-section m3-section--centered">
      <p className="m3-feature-card-label">What the model notices when it sees a &#39;3&#39;:</p>
      <div className="m3-section-card m3-section-card--feature m3-signal-activity m3-learning-problem-card">
        <div className="m3-section-heading">
          <p className="m3-eyebrow">A. LEARNING MEANS CHANGING</p>
          <h2>Can the model correct itself?</h2>
          <p className="m3-section-subtitle">
            A model improves when it compares its prediction with the correct answer.
          </p>
          <p className="m3-section-subtitle">
            First, it makes a prediction. Then it checks the target. The difference is the error. The model uses that error to adjust its weights, so the next prediction can improve.
          </p>
        </div>

        <div className="m3-controls m3-signal-activity__controls m3-signal-activity__controls--compact">
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
            <div
              className="m3-digit-card"
            >
              {step >= 0 ? (
                <div
                  aria-label="Handwritten digit 3"
                  className="m3-digit-mark"
                >
                  3
                </div>
              ) : null}
            </div>

            <div className="m3-mechanism-panel__header">
              <h3>Input</h3>
            </div>

            <p className="m3-section-subtitle m3-learning-copy">
              {step >= 0 ? `The model receives an input: a ${learningExample.inputLabel.toLowerCase()}.` : ''}
            </p>
          </article>

          <article className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <h3>Prediction, Target, Error</h3>
            </div>

            <div className="m3-compare-grid">
              <div className="m3-compare-card m3-compare-card--before">
                <p className="m3-compare-card__label">Before Learning</p>
                <div className="m3-compare-card__metrics">
                  <div className="m3-compare-metric">
                    <span>Prediction</span>
                    <strong>{showPrediction ? learningExample.before.prediction : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Target</span>
                    <strong>{showTarget ? learningExample.target : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric m3-compare-metric--error">
                    <span>Error</span>
                    <strong>{showError ? learningExample.before.error.toFixed(2) : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Target confidence</span>
                    <strong>{showError ? `${learningExample.before.confidenceTarget}%` : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Wrong-answer confidence</span>
                    <strong>{showError ? `${learningExample.before.confidenceWrong}%` : '...'}</strong>
                  </div>
                </div>
              </div>

              <div className="m3-compare-card m3-compare-card--after">
                <p className="m3-compare-card__label">After Learning</p>
                <div className="m3-compare-card__metrics">
                  <div className="m3-compare-metric">
                    <span>Prediction</span>
                    <strong>{showImprovedPrediction ? learningExample.after.prediction : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Target</span>
                    <strong>{showImprovedPrediction ? learningExample.target : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric m3-compare-metric--error">
                    <span>Error</span>
                    <strong>{showImprovedPrediction ? learningExample.after.error.toFixed(2) : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Target confidence</span>
                    <strong>{showImprovedPrediction ? `${learningExample.after.confidenceTarget}%` : '...'}</strong>
                  </div>
                  <div className="m3-compare-metric">
                    <span>Wrong-answer confidence</span>
                    <strong>{showImprovedPrediction ? `${learningExample.after.confidenceWrong}%` : '...'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="m3-mechanism-panel">
            <div className="m3-mechanism-panel__header">
              <h3>Weights</h3>
            </div>

            <div className="m3-weight-tile-grid">
              {learningExample.before.weights.map((weight) => {
                const isStrongest = weight.label === strongestWeight.label
                const delta = (weight.after - weight.before).toFixed(2)

                return (
                  <div
                    key={weight.label}
                    className={`m3-weight-tile${isStrongest ? ' is-strongest' : ''}${showWeightUpdate ? ' is-updated' : ''}`}
                  >
                    <div className="m3-weight-tile__head">
                      <span className="m3-weight-tile__label">{weight.label}</span>
                      {isStrongest ? <span className="m3-weight-tile__tag">Strongest</span> : null}
                    </div>
                    {showWeightUpdate ? (
                      <span style={{color: delta > 0 ? '#16a34a' : '#dc2626', marginLeft: 8}}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    ) : (
                      <span className="m3-weight-val">{weight.before.toFixed(2)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </article>
        </div>

      </div>
    </section>
  )
}

export default LearningProblem
