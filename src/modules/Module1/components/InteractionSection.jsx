import HotSurfaceInteractionPanel from './HotSurfaceInteractionPanel'

function InteractionSection() {
  return (
    <section className="module1-section module1-interaction-section">
      <div className="module1-section-heading module1-section-c__heading">
        <p className="module1-eyebrow">C. SOUND EXPERIMENT</p>
        <h2>When does a neuron fire?</h2>
        <p>
          Sound signals travel to the ear, become neural input, add together at the soma, and trigger a
          spike only if enough input reaches threshold in time.
        </p>
        <div className="module1-section-c__glossary" aria-label="Key terms">
          <span className="module1-section-c__glossary-chip">Soma — collects input</span>
          <span className="module1-section-c__glossary-chip">Threshold — level needed to fire</span>
          <span className="module1-section-c__glossary-chip">Spike — signal sent after firing</span>
        </div>
      </div>

      <HotSurfaceInteractionPanel />
    </section>
  )
}

export default InteractionSection
