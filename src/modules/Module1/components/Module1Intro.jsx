import HearingAttentionScene from './HearingAttentionScene'

function Module1Intro({ onStart }) {
  return (
    <section className="module1-section module1-intro-section">
      <div className="module1-two-column module1-intro-grid">
        <div className="module1-intro-lead">
          <p className="module1-eyebrow module1-intro-eyebrow">A. Intro</p>
          <h2 className="module1-intro-title">Meet a neuron in action</h2>
          <p className="module1-intro-copy">See how one neuron takes in signals and responds.</p>
          <div className="module1-inline-actions">
            <button className="module1-primary-button module1-intro-cta" onClick={onStart}>
              Start exploring
            </button>
          </div>
        </div>

        <div className="module1-panel module1-intro-panel module1-intro-panel-scene">
          <p className="module1-hero-side-label module1-text-reset">Selective attention</p>
          <h3 className="module1-panel-title module1-intro-panel-title">Hearing your name in a noisy room</h3>
          <HearingAttentionScene />
        </div>
      </div>
    </section>
  )
}

export default Module1Intro
