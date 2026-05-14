import { useState } from 'react'
import LossChart from './LossChart'

const trainingHistory = [
  {
    epoch: 0,
    prediction: '8',
    confidenceTarget: 41,
    confidenceWrong: 59,
    error: 0.59,
    note: 'The model starts with the wrong prediction.',
  },
  {
    epoch: 1,
    prediction: '8',
    confidenceTarget: 53,
    confidenceWrong: 47,
    error: 0.47,
    note: 'The target class becomes more likely.',
  },
  {
    epoch: 2,
    prediction: '3',
    confidenceTarget: 64,
    confidenceWrong: 36,
    error: 0.36,
    note: 'The prediction switches to the correct digit.',
  },
  {
    epoch: 3,
    prediction: '3',
    confidenceTarget: 72,
    confidenceWrong: 28,
    error: 0.28,
    note: 'The model becomes more confident.',
  },
  {
    epoch: 4,
    prediction: '3',
    confidenceTarget: 81,
    confidenceWrong: 19,
    error: 0.19,
    note: 'Error continues to fall.',
  },
  {
    epoch: 5,
    prediction: '3',
    confidenceTarget: 88,
    confidenceWrong: 12,
    error: 0.12,
    note: 'Repeated updates produce a stronger prediction.',
  },
]

function TrainingLab() {
  const [epochIndex, setEpochIndex] = useState(0)
  const current = trainingHistory[epochIndex]
  const isComplete = epochIndex === trainingHistory.length - 1

  const trainOneEpoch = () => {
    setEpochIndex((currentIndex) => Math.min(currentIndex + 1, trainingHistory.length - 1))
  }

  const resetTraining = () => setEpochIndex(0)

  return (
    <>
      <div className="m3-training-grid">
        <article className="m3-section-card m3-training-state-card">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Current Epoch</p>
            <h3>Track one digit as training repeats</h3>
          </div>

          <div className="m3-training-state-list">
            <div className="m3-training-state-row">
              <span>Current Epoch</span>
              <strong>{current.epoch}</strong>
            </div>
            <div className="m3-training-state-row">
              <span>Prediction</span>
              <strong>{current.prediction}</strong>
            </div>
            <div className="m3-training-state-row">
              <span>Target</span>
              <strong>3</strong>
            </div>
            <div className="m3-training-state-row">
              <span>Confidence in target answer</span>
              <strong>{current.confidenceTarget}%</strong>
            </div>
            <div className="m3-training-state-row">
              <span>Confidence in wrong answer</span>
              <strong>{current.confidenceWrong}%</strong>
            </div>
            <div className="m3-training-state-row">
              <span>Error</span>
              <strong>{current.error.toFixed(2)}</strong>
            </div>
          </div>

          <div className="m3-training-note">
            <span>Note</span>
            <p>{current.note}</p>
          </div>

          <div className="m3-training-actions">
            <button
              type="button"
              className="m3-btn m3-btn--primary"
              onClick={trainOneEpoch}
              disabled={isComplete}
            >
              Train One Epoch
            </button>
            <button type="button" className="m3-btn" onClick={resetTraining}>
              Reset Training
            </button>
            {isComplete ? <span className="m3-training-complete">Training Complete</span> : null}
          </div>
        </article>

        <article className="m3-section-card m3-training-chart-card">
          <div className="m3-training-card-head">
            <p className="m3-training-card-label">Error by Epoch</p>
            <h3>Lower error shows the model is improving</h3>
          </div>
          <LossChart trainingHistory={trainingHistory} epochIndex={epochIndex} />
        </article>
      </div>

      <article className="m3-section-card m3-training-summary-card">
        <h3>What changes after each epoch?</h3>
        <p>Weights are adjusted after each epoch.</p>
        <p>
          Early epochs make larger corrections because the model is farther from the target.
        </p>
        <p>
          Later epochs make smaller corrections because the prediction is closer to the target.
        </p>
      </article>

      <article className="m3-section-card m3-training-term-card">
        <p>
          In machine learning, this error score is often called <strong>loss</strong>.
        </p>
      </article>

      {isComplete ? (
        <article className="m3-section-card m3-training-takeaway-card">
          <p>Training is repeated correction.</p>
          <p>Each epoch gives the model feedback.</p>
          <p>The error measures how far the prediction is from the target.</p>
          <p>Weight updates change the model.</p>
          <p>Lower error means the model is improving on this task.</p>
        </article>
      ) : null}
    </>
  )
}

export default TrainingLab
