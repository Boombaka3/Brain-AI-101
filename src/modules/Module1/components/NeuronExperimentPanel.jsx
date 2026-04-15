import InfoTip from '../../../components/ui/InfoTip'

function formatValue(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function NeuronExperimentPanel({
  contributions,
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
        <div className="module1-panel-header-copy">
          <p className="module1-eyebrow module1-eyebrow-tight">Control panel</p>
          <h3 className="module1-panel-title module1-panel-title-large">Shape the incoming signal</h3>
          <p className="module1-card-muted module1-text-reset">
            Mix signal level and connection strength on each pathway, then test whether the neuron crosses threshold.
          </p>
        </div>
        <div className="module1-inline-actions">
          <button className="module1-primary-button" onClick={onRun}>
            Run model
          </button>
          <button className="module1-secondary-button" onClick={onReplay}>
            Replay signal
          </button>
          <button className="module1-ghost-button" onClick={onResetLesson}>
            Reset
          </button>
        </div>
      </div>

      <div className={`module1-result-banner ${willFire ? 'module1-result-banner-success' : 'module1-result-banner-pending'}`}>
        <div className="module1-result-banner-label">Current outcome</div>
        <div className="module1-result-banner-main">
          {willFire ? 'The neuron fires.' : 'The neuron stays quiet.'}
        </div>
        <div className="module1-result-banner-detail">
          Total input {formatValue(totalInput)} compared with threshold {formatValue(threshold)}.
        </div>
      </div>

      <div className="module1-interaction-summary-row">
        <div className="module1-stat module1-stat-compact">
          <div className="module1-card-muted">Draft total</div>
          <div className="module1-stat-value">{formatValue(totalInput)}</div>
        </div>
        <div className="module1-stat module1-stat-compact">
          <div className="module1-card-muted">Threshold</div>
          <div className="module1-stat-value">{formatValue(threshold)}</div>
        </div>
        <div className={`module1-stat module1-stat-compact module1-stat-highlight ${willFire ? 'module1-stat-highlight-success' : 'module1-stat-highlight-pending'}`}>
          <div className="module1-card-muted">Response</div>
          <div className={willFire ? 'module1-stat-outcome module1-status-success' : 'module1-stat-outcome module1-status-warn'}>
            {willFire ? 'fires' : 'quiet'}
          </div>
        </div>
      </div>

      <div className="module1-control-grid">
        {signalLevels.map((signal, index) => (
          <div className="module1-control-row module1-control-card" key={`control-${index}`}>
            <div className="module1-control-path">
              <div className="module1-control-label">Path {index + 1}</div>
              <div className="module1-card-muted module1-control-path-note">
                Contribution {formatValue(contributions[index])}
              </div>
            </div>

            <label className="module1-form-label">
              <span className="module1-form-label-text">
                Signal
                <InfoTip body="How much signal reaches this path." />
              </span>
              <input
                aria-label={`Signal level for pathway ${index + 1}`}
                className="module1-slider"
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
              <div className="module1-card-muted">Path total</div>
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
            max="12"
            min="1"
            onChange={(event) => setThreshold(Number(event.target.value))}
            step="0.5"
            type="range"
            value={threshold}
          />
        </label>
        <p className="module1-card-muted module1-threshold-note">
          Raise the threshold to make firing harder; lower it to make the neuron respond sooner.
        </p>
      </div>
    </div>
  )
}

export default NeuronExperimentPanel
