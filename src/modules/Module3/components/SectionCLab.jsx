import ClusteringLab from './ClusteringLab'
import NetworkPlaygroundCard from './NetworkPlaygroundCard'
import ReinforcementLab from './ReinforcementLab'

function SectionCLab() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. Learning in Action</p>
        <h2>Three Ways a Model Can Learn</h2>
        <p className="m3-section-subtitle">
          Start with pattern-finding, stop at a supervised playground, then finish with reward-based learning.
        </p>
      </div>

      <div className="m3-human-framing">
        <p><strong>What changes from part to part:</strong> the model is always adjusting, but the kind of feedback keeps changing.</p>
        <p>Unsupervised learning groups similar things. Supervised learning compares guesses to answers. Reinforcement learning learns from rewards and penalties.</p>
      </div>

      <ClusteringLab />

      <NetworkPlaygroundCard />

      <div className="m3-kmeans-bridge">
        <strong>One more shift:</strong> after labels and answer-checking, the next step drops the answer key and lets the agent learn from what happens after each move.
      </div>

      <ReinforcementLab embedded />
    </section>
  )
}

export default SectionCLab
