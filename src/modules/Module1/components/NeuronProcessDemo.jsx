import { getProcessReplayLabel, PROCESS_PHASES } from '../module1Config'

function NeuronProcessDemo({ currentPhase, diagram, onReplay, processSteps, runCount, summary }) {
  const activeIndex = processSteps.findIndex((step) => step.id === currentPhase)
  const isFiringMoment =
    currentPhase === PROCESS_PHASES.FIRE || currentPhase === PROCESS_PHASES.PASS_ON

  return (
    <section className="module1-section module1-process-section">
      <div className="module1-section-heading module1-process-heading">
        <p className="module1-eyebrow">B. Process Visualization</p>
        <h2>Follow the signal as it moves through the neuron</h2>
        <p>Watch the neuron receive information, decide, and respond.</p>
      </div>

      <div className="module1-process-storyboard" aria-label="Neuron process visualization">
        <div className="module1-process-phase-row" aria-label="Current neuron concept">
          {processSteps.map((step, index) => {
            return (
              <span className={`module1-process-phase-pill${index === activeIndex ? ' is-active' : ''}`} key={step.id}>
                {step.label}
              </span>
            )
          })}
        </div>

        <div className={`module1-hero-shell module1-process-visual${isFiringMoment ? ' is-firing' : ''}`}>
          <div className="module1-process-diagram-frame">{diagram}</div>
        </div>
      </div>

      <div className="module1-process-summary">
        <p className="module1-card-muted module1-process-summary-body module1-process-live-copy" aria-live="polite">
          {summary.body}
        </p>
        <button className="module1-secondary-button module1-process-replay" onClick={onReplay}>
          {getProcessReplayLabel(runCount)}
        </button>
      </div>
    </section>
  )
}

export default NeuronProcessDemo
