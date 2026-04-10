function Module1Intro({ onStart }) {
  return (
    <section className="module1-section module1-intro-section">
      <div className="module1-two-column module1-intro-grid">
        <div className="module1-intro-lead">
          <p className="module1-eyebrow module1-intro-eyebrow">A. Intro</p>
          <h2 className="module1-intro-title">Watch one neuron decide.</h2>
          <p className="module1-intro-copy">
            First, observe how signals enter, build inside the soma, reach threshold, and travel onward.
          </p>
          <div className="module1-inline-actions">
            <button className="module1-primary-button module1-intro-cta" onClick={onStart}>
              Start Observing
            </button>
          </div>
        </div>

        <div className="module1-panel module1-intro-panel">
          <p className="module1-hero-side-label module1-text-reset">By the end of this module</p>
          <h3 className="module1-panel-title module1-intro-panel-title">Students should be able to explain:</h3>
          <div className="module1-chip-row module1-chip-row-tight module1-intro-chip-row">
            <span className="module1-chip">Dendrites receive</span>
            <span className="module1-chip">Synapses weight</span>
            <span className="module1-chip">Soma adds up</span>
            <span className="module1-chip">Threshold decides</span>
            <span className="module1-chip">Axon passes on</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Module1Intro
