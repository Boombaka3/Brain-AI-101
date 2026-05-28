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
    <div className="m3-training-board">
      <div className="m3-training-board__top">
        <article className="m3-section-card m3-training-board__card">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Model Status</p>
            <h3>Prediction, target, and error</h3>
          </div>

          <div className="m3-training-status-grid">
            <div className="m3-training-status-tile">
              <span>Prediction</span>
              <strong>{current.prediction}</strong>
            </div>
            <div className="m3-training-status-tile">
              <span>Target</span>
              <strong>{current.target}</strong>
            </div>
            <div className="m3-training-status-tile m3-training-status-tile--error">
              <span>Error</span>
              <strong>{current.error.toFixed(2)}</strong>
            </div>
          </div>

          <div className="m3-training-confidence-grid">
            <div className="m3-training-confidence-card">
              <span>Target confidence</span>
              <strong>{current.confidenceTarget}%</strong>
              <div className="m3-training-confidence-track" aria-hidden="true">
                <div className="m3-training-confidence-fill" style={{ width: `${current.confidenceTarget}%` }} />
              </div>
            </div>
            <div className="m3-training-confidence-card m3-training-confidence-card--wrong">
              <span>Wrong confidence</span>
              <strong>{current.confidenceWrong}%</strong>
              <div className="m3-training-confidence-track" aria-hidden="true">
                <div className="m3-training-confidence-fill m3-training-confidence-fill--wrong" style={{ width: `${current.confidenceWrong}%` }} />
              </div>
            </div>
          </div>
        </article>

        <article className="m3-section-card m3-training-board__card m3-training-board__card--control">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Training Control</p>
            <h3>Current round</h3>
          </div>

          <div className="m3-training-round-display">
            <span>Round</span>
            <strong>{current.round}</strong>
          </div>

          <div className="m3-training-actions m3-training-actions--board">
            <button
              type="button"
              className="m3-btn m3-btn--primary"
              onClick={trainOneRound}
              disabled={isComplete}
            >
              Train One Round
            </button>
            <button type="button" className="m3-btn" onClick={resetTraining}>
              Reset Training
            </button>
          </div>

          <div className="m3-training-mini-note">
            <span>Small note</span>
            <p>In machine learning, one training round is often called an epoch.</p>
          </div>

          {isComplete ? <span className="m3-training-complete">Target reached</span> : null}
        </article>

        <article className="m3-section-card m3-training-board__card m3-training-chart-card">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Error by Round</p>
            <h3>Lower error means the toy model is improving</h3>
          </div>
          <LossChart trainingHistory={trainingRounds} roundIndex={roundIndex} />
        </article>
      </div>

      <div className="m3-training-board__bottom">
        <article className="m3-section-card m3-training-board__card">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Weights</p>
            <h3>Feature weights shift a little each round</h3>
          </div>

          <div className="m3-training-weight-grid">
            {current.weights.map((weight) => {
              const isStrongest = weight.label === strongestWeight.label

              return (
                <div key={weight.label} className={`m3-training-weight-tile${isStrongest ? ' is-strongest' : ''}`}>
                  <span className="m3-training-weight-label">{weight.label}</span>
                  {isStrongest ? <span className="m3-training-weight-tag">Strongest</span> : null}
                  <strong className="m3-training-weight-value">{weight.value.toFixed(2)}</strong>
                </div>
              )
            })}
          </div>
        </article>
      </div>
    </div>
  )
}

export default TrainingLab
