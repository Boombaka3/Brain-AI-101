import ClusteringLab from './ClusteringLab'
import NetworkPlaygroundCard from './NetworkPlaygroundCard'
import ReinforcementLab from './ReinforcementLab'

function SectionCLab() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. LEARNING IN ACTION</p>
        <h2>Compare the three learning signals</h2>
        <p className="m3-section-subtitle">
          Unsupervised: similarity
          Supervised: target
          Reinforcement: reward
        </p>
      </div>

      <div className="m3-signal-strip">
        <span className="m3-signal-chip">Unsupervised Learning: Find Groups</span>
        <span className="m3-signal-chip">Supervised Learning: Compare With Target</span>
        <span className="m3-signal-chip">Reinforcement Learning: Learn From Rewards</span>
      </div>

      <ClusteringLab />
      <NetworkPlaygroundCard />
      <ReinforcementLab embedded />
    </section>
  )
}

export default SectionCLab
