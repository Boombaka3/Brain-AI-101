import InfoTip from '../../../components/ui/InfoTip'

function formatValue(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function NeuronExperimentPanel({
  contributions,
  interactionLocked,
  onReplay,
  onResetLesson,
  onRun,
  setSignalLevels,
  setSynapseStrengths,
  setThreshold,
  signalLevels,
  synapseStrengths,
  threshold,
  totalInput,
}) {
  const willFire = totalInput >= threshold

  return (
    <div className="module1-panel module1-interaction-panel">
      <div className="module1-panel-header">
        <div>
          <p className="module1-eyebrow module1-eyebrow-tight">Set up the next run</p>
          <h3 className="module1-panel-title module1-panel-title-large">Adjust the neuron</h3>
          <p className="module1-card-muted module1-text-reset">
            Change what reaches the neuron, then press <strong>Run</strong> to watch its next decision.
          </p>
        </div>
        <div className="module1-inline-actions">
          <button className="module1-primary-button" disabled={interactionLocked} onClick={onRun}>
            Run
          </button>
          <button className="module1-secondary-button" disabled={interactionLocked} onClick={onReplay}>
            Replay
          </button>
          <button className="module1-ghost-button" disabled={interactionLocked} onClick={onResetLesson}>
            Reset
          </button>
        </div>
      </div>

      <div className={`module1-result-banner ${willFire ? 'module1-result-banner-success' : 'module1-result-banner-pending'}`}>
        <div className="module1-result-banner-label">Current result</div>
        <div className="module1-result-banner-main">
          {willFire ? 'This neuron will fire.' : 'This neuron will stay silent.'}
        </div>
        <div className="module1-result-banner-detail">
          Total {formatValue(totalInput)} compared with threshold {formatValue(threshold)}.
        </div>
      </div>

      <div className="module1-control-grid">
        {signalLevels.map((signal, index) => (
          <div className="module1-control-row module1-control-card" key={`control-${index}`}>
            <div className="module1-control-path">
              <div className="module1-control-label">Path {index + 1}</div>
              <div className="module1-card-muted module1-control-path-note">Path total: {formatValue(contributions[index])}</div>
            </div>

            <label className="module1-form-label">
              <span className="module1-form-label-text">
                Signal
                <InfoTip body="How much signal reaches this path." />
              </span>
              <input
                aria-label={`Signal level for pathway ${index + 1}`}
                className="module1-slider"
                disabled={interactionLocked}
                max="5"
                min="0"
                onChange={(event) =>
                  setSignalLevels((current) =>
                    current.map((value, currentIndex) => (currentIndex === index ? Number(event.target.value) : value)),
                  )
                }
                step="1"
                type="range"
                value={signal}
              />
            </label>

            <label className="module1-form-label">
              <span className="module1-form-label-text">
                Strength
                <InfoTip body="Stronger connections make the same signal matter more." />
              </span>
              <input
                aria-label={`Synaptic strength for pathway ${index + 1}`}
                className="module1-slider"
                disabled={interactionLocked}
                max="2"
                min="0"
                onChange={(event) =>
                  setSynapseStrengths((current) =>
                    current.map((value, currentIndex) =>
                      currentIndex === index ? Number(event.target.value) : value,
                    ),
                  )
                }
                step="0.5"
                type="range"
                value={synapseStrengths[index]}
              />
            </label>

            <div className="module1-control-value module1-control-value-prominent">
              <div className="module1-card-muted">Total</div>
              <div className="module1-control-value-number">{formatValue(contributions[index])}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="module1-threshold-block module1-threshold-card">
        <label className="module1-form-label">
          <span className="module1-threshold-label">
            Threshold
            <InfoTip body="The neuron fires when the soma total reaches this level." />
          </span>
          <input
            aria-label="Neuron firing threshold"
            className="module1-slider"
            disabled={interactionLocked}
            max="12"
            min="1"
            onChange={(event) => setThreshold(Number(event.target.value))}
            step="0.5"
            type="range"
            value={threshold}
          />
        </label>
        <p className="module1-card-muted module1-threshold-note">
          Higher threshold means the neuron needs more total signal before it fires.
        </p>
      </div>

      <div className="module1-stat-grid">
        <div className="module1-stat">
          <div className="module1-card-muted">Total</div>
          <div className="module1-stat-value">{formatValue(totalInput)}</div>
        </div>
        <div className="module1-stat">
          <div className="module1-card-muted">Threshold</div>
          <div className="module1-stat-value">{formatValue(threshold)}</div>
        </div>
        <div className={`module1-stat module1-stat-highlight ${willFire ? 'module1-stat-highlight-success' : 'module1-stat-highlight-pending'}`}>
          <div className="module1-card-muted">Outcome</div>
          <div className={willFire ? 'module1-stat-outcome module1-status-success' : 'module1-stat-outcome module1-status-warn'}>
            {willFire ? 'Will fire' : 'Stay silent'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NeuronExperimentPanel
