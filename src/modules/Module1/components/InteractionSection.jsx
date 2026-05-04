import HotSurfaceInteractionPanel from './HotSurfaceInteractionPanel'

function InteractionSection() {
  return (
    <section className="module1-section module1-interaction-section">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">C. Sound Experiment</p>
        <h2>Which signals push a neuron over threshold?</h2>
        <p>
          Pick sounds, change their strength and timing, and watch the soma behave like a leaky bucket.
          Close, strong signals combine. Weak or delayed signals fade before the neuron commits.
        </p>
      </div>

      <HotSurfaceInteractionPanel />
    </section>
  )
}

export default InteractionSection
