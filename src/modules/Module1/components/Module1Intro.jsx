function Module1Intro({ onStart }) {
  return (
    <section className="module1-section module1-intro-section">
      <div className="module1-two-column module1-intro-grid">
        <div className="module1-intro-lead">
          <p className="module1-eyebrow module1-intro-eyebrow">A. Intro</p>
          <h2 className="module1-intro-title">Meet a neuron in action</h2>
          <p className="module1-intro-copy">
            In this module, you'll look at how one neuron receives signals, builds toward a response, and passes that
            signal forward.
          </p>
          <div className="module1-inline-actions">
            <button className="module1-primary-button module1-intro-cta" onClick={onStart}>
              Start exploring
            </button>
          </div>
        </div>

        <div className="module1-panel module1-intro-panel">
          <p className="module1-hero-side-label module1-text-reset">In this module</p>
          <h3 className="module1-panel-title module1-intro-panel-title">You'll focus on:</h3>
          <div className="module1-chip-row module1-chip-row-tight module1-intro-chip-row">
            <span className="module1-chip">signals come in</span>
            <span className="module1-chip">connections change impact</span>
            <span className="module1-chip">the soma adds them up</span>
            <span className="module1-chip">threshold shapes the response</span>
            <span className="module1-chip">the axon carries the signal on</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Module1Intro
