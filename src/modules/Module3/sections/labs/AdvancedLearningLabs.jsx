import ClusteringLab from '../../features/clustering/ClusteringLab'
import NetworkPlaygroundCard from './NetworkPlaygroundCard'
import ReinforcementLab from '../../features/reinforcement/ReinforcementLab'

const ADVANCED_CARDS = [
  {
    title: 'Unsupervised Extension',
    subtitle: 'Find groups in unlabeled data',
    accent: 'unsupervised',
    render: () => <ClusteringLab />,
  },
  {
    title: 'Supervised Extension',
    subtitle: 'Explore decision boundaries',
    accent: 'supervised',
    render: () => <NetworkPlaygroundCard />,
  },
  {
    title: 'Reinforcement Extension',
    subtitle: 'Learn from action consequences',
    accent: 'reinforcement',
    render: () => <ReinforcementLab embedded />,
  },
]

function AdvancedLearningLabs() {
  return (
    <section className="m3-section">
      <div className="m3-section-card m3-section-card--feature m3-section-shell m3-advanced-learning-labs">
        <div className="m3-section-heading m3-advanced-learning-labs__intro">
          <p className="m3-eyebrow">F. OPTIONAL EXTENSIONS</p>
          <h2>Advanced Learning Labs</h2>
        </div>

        <div className="m3-advanced-learning-labs__stack">
          {ADVANCED_CARDS.map((card) => (
            <article
              key={card.title}
              className={`m3-advanced-learning-labs__card ${card.accent}`}
            >
              <div className="m3-advanced-learning-labs__card-copy">
                <p className="m3-advanced-learning-labs__label">{card.title}</p>
                <h4>{card.subtitle}</h4>
              </div>
              <div className="m3-advanced-learning-labs__card-body">
                {card.render()}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdvancedLearningLabs
