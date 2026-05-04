import GuidedAnatomyOverlay from './GuidedAnatomyOverlay'

const PARTS = ['Dendrites', 'Soma', 'Axon', 'Terminals']

function Module1AnatomySection({ onContinue }) {
  return (
    <section className="module1-section module1-anatomy-section">
      <div className="module1-anatomy-grid">
        <div className="module1-anatomy-copy">
          <p className="module1-eyebrow">B. Biological Neuron Anatomy</p>
          <h2 className="module1-anatomy-title">Zoom In On One Decision-Maker</h2>
          <p className="module1-anatomy-body">
            Right now, millions of neurons are firing in your brain to let you read this
            sentence. Each one makes a single decision: fire or stay quiet. Let&apos;s zoom in on
            just one.
          </p>

          <div className="module1-anatomy-pill-row" aria-label="Neuron parts">
            {PARTS.map((part) => (
              <span key={part} className="module1-anatomy-pill">{part}</span>
            ))}
          </div>

          <div className="module1-anatomy-note">
            <p className="module1-card-muted module1-text-reset">
              Click the glowing hotspots in order to reveal each part and see the zoomed view.
            </p>
          </div>
        </div>

        <div className="module1-anatomy-stage">
          <GuidedAnatomyOverlay onComplete={onContinue} finishLabel="Continue to the sound experiment" />
        </div>
      </div>
    </section>
  )
}

export default Module1AnatomySection
