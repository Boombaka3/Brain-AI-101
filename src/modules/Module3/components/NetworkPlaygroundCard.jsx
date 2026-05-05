import { useMemo, useState } from 'react'

const TRIALS = [
  {
    id: 'trial-a',
    label: 'Trial A',
    prompt: 'Stay inside',
    inputs: [1, 0, 1],
    target: 0,
  },
  {
    id: 'trial-b',
    label: 'Trial B',
    prompt: 'Go outside',
    inputs: [1, 0, 0],
    target: 1,
  },
]

const BASE_WEIGHTS = [0.4, 0.7, 0.2]
const THRESHOLD = 0.5

function runTrial(inputs, weights, target) {
  const score = Number(inputs.reduce((sum, input, index) => sum + input * weights[index], 0).toFixed(1))
  const prediction = score >= THRESHOLD ? 1 : 0
  const error = target - prediction
  const nextWeights = weights.map((weight, index) =>
    Number((weight + (inputs[index] === 1 ? error * 0.1 : 0)).toFixed(1)),
  )
  const nextScore = Number(inputs.reduce((sum, input, index) => sum + input * nextWeights[index], 0).toFixed(1))
  const nextPrediction = nextScore >= THRESHOLD ? 1 : 0

  return {
    score,
    prediction,
    error,
    nextWeights,
    nextScore,
    nextPrediction,
  }
}

function NetworkPlaygroundCard() {
  const [selectedTrialId, setSelectedTrialId] = useState(TRIALS[0].id)
  const [step, setStep] = useState(0)

  const trial = TRIALS.find((item) => item.id === selectedTrialId) ?? TRIALS[0]
  const result = useMemo(
    () => runTrial(trial.inputs, BASE_WEIGHTS, trial.target),
    [trial],
  )

  return (
    <div className="m3-section-card m3-playground-card">
      <div className="m3-playground-heading">
        <p className="m3-rl-control-label">Part 2 · Supervised learning</p>
        <h3>Correct answers push weights up or down</h3>
        <p className="m3-type-desc">Only active inputs update.</p>
      </div>

      <div className="m3-mechanism-steps">
        {['Guess', 'Target', 'Update', 'Try again'].map((label, index) => (
          <button
            key={label}
            type="button"
            className={`m3-step-chip${step === index + 1 ? ' is-active' : ''}${step > index + 1 ? ' is-complete' : ''}`}
            onClick={() => setStep(index + 1)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="m3-controls">
        {TRIALS.map((item) => (
          <button
            key={item.id}
            className={`m3-btn${selectedTrialId === item.id ? ' m3-btn--active' : ''}`}
            onClick={() => {
              setSelectedTrialId(item.id)
              setStep(0)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="m3-supervised-demo">
        <div className="m3-mechanism-panel">
          <div className="m3-mini-callout">
            <strong>Target</strong>
            <span>{trial.prompt}</span>
          </div>

          <div className="m3-value-grid">
            {trial.inputs.map((value, index) => (
              <div key={`${trial.id}-${index}`} className={`m3-value-card${value === 1 ? ' is-on' : ''}`}>
                <span>x{index + 1}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="m3-mechanism-table">
            <div className="m3-mechanism-table__row m3-mechanism-table__row--head">
              <span>Weight</span>
              <span>Before</span>
              <span>After</span>
            </div>
            {BASE_WEIGHTS.map((weight, index) => (
              <div key={`${trial.id}-weight-${index}`} className="m3-mechanism-table__row">
                <span>w{index + 1}</span>
                <span>{weight.toFixed(1)}</span>
                <span>{step >= 3 ? result.nextWeights[index].toFixed(1) : '...'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="m3-mechanism-panel m3-mechanism-panel--feedback">
          <div className="m3-feedback-stack">
            <div className="m3-feedback-box">
              <span>Prediction</span>
              <strong>{step >= 1 ? result.prediction : '...'}</strong>
            </div>
            <div className="m3-feedback-box">
              <span>Target</span>
              <strong>{step >= 2 ? trial.target : '...'}</strong>
            </div>
            <div className="m3-feedback-box">
              <span>Error</span>
              <strong>{step >= 2 ? result.error : '...'}</strong>
            </div>
          </div>

          <div className="m3-before-after">
            <div className="m3-before-after__card">
              <span>Score</span>
              <strong>{step >= 1 ? result.score.toFixed(1) : '...'}</strong>
            </div>
            <div className="m3-before-after__arrow">→</div>
            <div className="m3-before-after__card is-good">
              <span>New score</span>
              <strong>{step >= 4 ? result.nextScore.toFixed(1) : '...'}</strong>
            </div>
          </div>

          <div className="m3-before-after">
            <div className="m3-before-after__card">
              <span>Before</span>
              <strong>{step >= 1 ? result.prediction : '...'}</strong>
            </div>
            <div className="m3-before-after__arrow">→</div>
            <div className="m3-before-after__card is-good">
              <span>After</span>
              <strong>{step >= 4 ? result.nextPrediction : '...'}</strong>
            </div>
          </div>

          <div className="m3-formula-strip">
            <span>Threshold = 0.5</span>
            <span>{step >= 3 ? 'Weights move by 0.1 when the guess is wrong.' : 'Waiting for feedback.'}</span>
          </div>
        </div>
      </div>

      <div className="m3-controls">
        <button className="m3-btn" onClick={() => setStep(1)}>Show Guess</button>
        <button className="m3-btn" onClick={() => setStep(2)}>Show Target</button>
        <button className="m3-btn" onClick={() => setStep(3)}>Update Weights</button>
        <button className="m3-btn m3-btn--primary" onClick={() => setStep(4)}>Try Again</button>
        <button className="m3-btn" onClick={() => setStep(0)}>Reset</button>
      </div>
    </div>
  )
}

export default NetworkPlaygroundCard
