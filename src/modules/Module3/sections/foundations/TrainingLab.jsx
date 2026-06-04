import { useState } from 'react'
import LossChart from './LossChart'

const trainingRounds = [
  {
    round: 0,
    prediction: '8',
    target: '9',
    error: 0.42,
    confidenceTarget: 38,
    confidenceWrong: 62,
    weights: [
      { label: 'Upper curve', value: 0.28 },
      { label: 'Closed loop', value: 0.34 },
      { label: 'Open gap', value: 0.41 },
      { label: 'Lower curve', value: 0.25 },
    ],
  },
  {
    round: 1,
    prediction: '8',
    target: '9',
    error: 0.31,
    confidenceTarget: 49,
    confidenceWrong: 51,
    weights: [
      { label: 'Upper curve', value: 0.31 },
      { label: 'Closed loop', value: 0.43 },
      { label: 'Open gap', value: 0.34 },
      { label: 'Lower curve', value: 0.30 },
    ],
  },
  {
    round: 2,
    prediction: '9',
    target: '9',
    error: 0.22,
    confidenceTarget: 61,
    confidenceWrong: 39,
    weights: [
      { label: 'Upper curve', value: 0.34 },
      { label: 'Closed loop', value: 0.52 },
      { label: 'Open gap', value: 0.28 },
      { label: 'Lower curve', value: 0.36 },
    ],
  },
  {
    round: 3,
    prediction: '9',
    target: '9',
    error: 0.13,
    confidenceTarget: 73,
    confidenceWrong: 27,
    weights: [
      { label: 'Upper curve', value: 0.37 },
      { label: 'Closed loop', value: 0.61 },
      { label: 'Open gap', value: 0.22 },
      { label: 'Lower curve', value: 0.41 },
    ],
  },
  {
    round: 4,
    prediction: '9',
    target: '9',
    error: 0.06,
    confidenceTarget: 86,
    confidenceWrong: 14,
    weights: [
      { label: 'Upper curve', value: 0.40 },
      { label: 'Closed loop', value: 0.70 },
      { label: 'Open gap', value: 0.17 },
      { label: 'Lower curve', value: 0.45 },
    ],
  },
]

function TrainingLab() {
  const [roundIndex, setRoundIndex] = useState(0)
  const current = trainingRounds[roundIndex]
  const isComplete = roundIndex === trainingRounds.length - 1
  const strongestWeight = current.weights.reduce((strongest, weight) => (
    weight.value > strongest.value ? weight : strongest
  ), current.weights[0])

  const trainOneRound = () => {
    setRoundIndex((value) => Math.min(value + 1, trainingRounds.length - 1))
  }

  const resetTraining = () => setRoundIndex(0)

  return (
    <div className="m3-training-unified">

      {/* Top row: curve + weight tracker */}
      <div className="m3-training-unified__top">

        {/* Loss curve — dominant left panel */}
        <div className="m3-training-unified__curve">
          <p className="m3-training-card-label">Error by round</p>
          <p className="m3-training-unified__curve-hint">
            Each dot is one training round. Watch the line fall.
          </p>
          <LossChart trainingHistory={trainingRounds} roundIndex={roundIndex} />
        </div>

        {/* Weight tracker — right panel */}
        <div className="m3-training-unified__weights">
          <p className="m3-training-card-label">Weight changing most</p>
          <div className="m3-training-unified__weight-feature">
            <span className="m3-training-unified__weight-name">Closed loop</span>
            <div className="m3-training-unified__weight-row">
              <span className="m3-training-unified__weight-start">
                Start: {trainingRounds[0].weights[1].value.toFixed(2)}
              </span>
              <span className="m3-training-unified__weight-arrow">→</span>
              <span className="m3-training-unified__weight-now">
                Now: {current.weights[1].value.toFixed(2)}
              </span>
            </div>
            <div className="m3-training-unified__weight-bar-shell">
              <div
                className="m3-training-unified__weight-bar-fill"
                style={{ width: `${(current.weights[1].value / 1.0) * 100}%` }}
              />
            </div>
            <span className="m3-training-unified__weight-delta">
              {current.round === 0
                ? 'No change yet'
                : `+${(current.weights[1].value - trainingRounds[0].weights[1].value).toFixed(2)} after ${current.round} round${current.round === 1 ? '' : 's'}`
              }
            </span>
          </div>

          {/* Status tiles — compact */}
          <div className="m3-training-unified__tiles">
            <div className="m3-training-unified__tile">
              <span>Prediction</span>
              <strong>{current.prediction}</strong>
            </div>
            <div className="m3-training-unified__tile">
              <span>Target</span>
              <strong>{current.target}</strong>
            </div>
            <div className="m3-training-unified__tile m3-training-unified__tile--error">
              <span>Error</span>
              <strong>{current.error.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: controls */}
      <div className="m3-training-unified__controls">
        <div className="m3-training-unified__round-badge">
          Round <strong>{current.round}</strong> of {trainingRounds.length - 1}
        </div>
        <div className="m3-training-unified__actions">
          {!isComplete ? (
            <button
              type="button"
              className="m3-btn m3-btn--primary m3-training-unified__advance"
              onClick={trainOneRound}
            >
              Train one round →
            </button>
          ) : (
            <div className="m3-training-unified__complete">
              ✓ Model converged — error reached {current.error.toFixed(2)}
            </div>
          )}
          <button type="button" className="m3-btn m3-stepper-reset" onClick={resetTraining}>
            Reset
          </button>
        </div>
        <p className="m3-training-unified__note">
          One pass through the training data is called an epoch.
          Most real models need hundreds.
        </p>
      </div>

    </div>
  )
}

export default TrainingLab
