function BrainConnection() {
  return (
    <section className="m3-section">
      <div className="module3-dopamine-panel">
        <p className="module3-dopamine-label">Dopamine prediction error - 3 cases</p>
        <div className="module3-dopamine-row">
          <div className="module3-dopamine-card">
            <div className="module3-dopamine-emoji">Food</div>
            <p className="module3-dopamine-title">Expected food arrives</p>
            <p className="module3-dopamine-desc">Prediction matches reality. No surprise.</p>
            <span className="module3-dopamine-signal module3-dopamine--neutral">Dopamine = 0</span>
          </div>
          <div className="module3-dopamine-card" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <div className="module3-dopamine-emoji">Gift</div>
            <p className="module3-dopamine-title">Unexpected food arrives</p>
            <p className="module3-dopamine-desc">Better than expected - learn to repeat.</p>
            <span className="module3-dopamine-signal module3-dopamine--positive">Dopamine spike</span>
          </div>
          <div className="module3-dopamine-card" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
            <div className="module3-dopamine-emoji">Miss</div>
            <p className="module3-dopamine-title">Predicted food missing</p>
            <p className="module3-dopamine-desc">Worse than expected - update model.</p>
            <span className="module3-dopamine-signal module3-dopamine--negative">Dopamine dip</span>
          </div>
        </div>
        <div className="module3-dopamine-bridge">
          This is identical to the error term in supervised learning weight updates: <strong>error = expected - actual</strong>. Positive error strengthens connections; negative error weakens them.
        </div>
      </div>
    </section>
  )
}

export default BrainConnection
