import { getProcessPhaseLabel } from '../module1Config'

function LiveExplanationPanel({ currentPhase, neuronBFires, neuronFires, summary, threshold, totalInput }) {
  return (
    <aside aria-live="polite" className="module1-panel module1-explanation-panel">
      <p className="module1-eyebrow module1-eyebrow-tight">
        What this run shows
      </p>
      <h3 className="module1-panel-title module1-panel-title-xl">{summary.title}</h3>
      <p className="module1-card-muted module1-body-copy module1-stack-gap-md">
        {summary.body}
      </p>

      <div className="module1-panel module1-soft-panel module1-inner-panel module1-explanation-state">
        <div className="module1-detail-row">
          <span className="module1-card-muted">Step</span>
          <strong>{getProcessPhaseLabel(currentPhase)}</strong>
        </div>
        <div className="module1-detail-row">
          <span className="module1-card-muted">Total / threshold</span>
          <strong>
            {totalInput} / {threshold}
          </strong>
        </div>
        <div className="module1-detail-row">
          <span className="module1-card-muted">This neuron</span>
          <strong className={neuronFires ? 'module1-status-success' : 'module1-status-warn'}>
            {neuronFires ? 'fires' : 'stays quiet'}
          </strong>
        </div>
        <div className="module1-detail-row module1-detail-row-last">
          <span className="module1-card-muted">Signal passed on</span>
          <strong className={neuronBFires ? 'module1-status-success' : 'module1-status-warn'}>
            {neuronBFires ? 'yes' : 'no'}
          </strong>
        </div>
      </div>

      <div className="module1-stack-gap-sm">
        <h4 className="module1-subtitle">Key idea</h4>
        <p className="module1-card-muted module1-text-reset">
          Inputs build together in the soma, and the signal only continues if that total reaches threshold.
        </p>
      </div>
    </aside>
  )
}

export default LiveExplanationPanel
