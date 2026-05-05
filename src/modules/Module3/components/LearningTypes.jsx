import { useMemo, useState } from 'react'

const UNSUPERVISED_ITEMS = [
  { label: 'Point A', group: 'group1' },
  { label: 'Point B', group: 'group1' },
  { label: 'Point C', group: 'group1' },
  { label: 'Point D', group: 'group2' },
  { label: 'Point E', group: 'group2' },
  { label: 'Point F', group: 'group2' },
]

const RL_STEPS = [
  { label: 'Move up → safe path', reward: '+1', nextValues: { up: 0.1, right: 0.4, down: 0.0, left: 0.0 } },
  { label: 'Move right → blocked path', reward: '-1', nextValues: { up: 0.1, right: 0.4, down: -0.5, left: 0.0 } },
  { label: 'Reach goal → success', reward: '+10', nextValues: { up: 0.1, right: 0.9, down: -0.5, left: 0.0 } },
]

function LearningTypes({ isMobile, onJumpToSectionC }) {
  const [supervisedStage, setSupervisedStage] = useState(0)
  const [unsupervisedGrouped, setUnsupervisedGrouped] = useState(false)
  const [reinforcementStage, setReinforcementStage] = useState(0)

  const reinforcementValues = useMemo(() => {
    if (reinforcementStage === 0) {
      return { up: 0.1, right: 0.2, down: 0.0, left: 0.0 }
    }

    return RL_STEPS[reinforcementStage - 1].nextValues
  }, [reinforcementStage])

  const bestMove = Object.entries(reinforcementValues).sort((a, b) => b[1] - a[1])[0][0]

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">B. LEARNING SIGNALS</p>
        <h2>Same pattern, different feedback.</h2>
        <p className="m3-section-subtitle">Each learning type uses a different signal.</p>
      </div>

      <div
        className="m3-types-grid m3-types-grid--three m3-types-grid--mechanisms"
        style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}
      >
        <article className="m3-type-card m3-type-card--story">
          <div className="m3-type-title">Supervised Learning</div>
          <p>Signal: target answer</p>
          <p>The model compares its prediction with the correct answer.</p>

          <div className="m3-feedback-stack">
            <div className="m3-feedback-box">
              <span>Prediction</span>
              <strong>{supervisedStage >= 1 ? '1' : '...'}</strong>
            </div>
            <div className="m3-feedback-box">
              <span>Target</span>
              <strong>{supervisedStage >= 2 ? '0' : '...'}</strong>
            </div>
            <div className="m3-feedback-box">
              <span>Error</span>
              <strong>{supervisedStage >= 2 ? '-1' : '...'}</strong>
            </div>
          </div>

          <div className="m3-mini-weights">
            <div className="m3-mini-weights__row">
              <span>w1</span>
              <strong>{supervisedStage >= 3 ? '0.4 → 0.3' : '0.4'}</strong>
            </div>
            <div className="m3-mini-weights__row">
              <span>w2</span>
              <strong>{supervisedStage >= 3 ? '0.7 → 0.7' : '0.7'}</strong>
            </div>
            <div className="m3-mini-weights__row">
              <span>w3</span>
              <strong>{supervisedStage >= 3 ? '0.2 → 0.1' : '0.2'}</strong>
            </div>
          </div>

          <div className="m3-controls">
            <button className="m3-btn" onClick={() => setSupervisedStage(1)}>Show Prediction</button>
            <button className="m3-btn" onClick={() => setSupervisedStage(2)}>Show Target</button>
            <button className="m3-btn" onClick={() => setSupervisedStage(3)}>Update Weights</button>
            <button className="m3-btn" onClick={() => setSupervisedStage(0)}>Reset</button>
          </div>

          <p className="m3-type-desc">Weights update after feedback. Target answers guide the update.</p>
        </article>

        <article className="m3-type-card m3-type-card--story">
          <div className="m3-type-title">Unsupervised Learning</div>
          <p>Signal: similarity</p>
          <p>The model finds groups without target answers.</p>

          <div className={`m3-pattern-board ${unsupervisedGrouped ? 'is-grouped' : ''}`}>
            {UNSUPERVISED_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`m3-pattern-chip ${unsupervisedGrouped ? `is-${item.group}` : ''}`}
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="m3-before-after">
            <div className="m3-before-after__card">
              <span>Before</span>
              <strong>Mixed items</strong>
            </div>
            <div className="m3-before-after__arrow">→</div>
            <div className="m3-before-after__card is-good">
              <span>After</span>
              <strong>{unsupervisedGrouped ? 'Grouped by similarity' : 'Waiting'}</strong>
            </div>
          </div>

          <div className="m3-controls">
            <button className="m3-btn" onClick={() => setUnsupervisedGrouped(true)}>Show Distance</button>
            <button className="m3-btn" onClick={() => setUnsupervisedGrouped(true)}>Find Groups</button>
            <button className="m3-btn" onClick={() => setUnsupervisedGrouped(true)}>Move Centers</button>
            <button className="m3-btn" onClick={() => setUnsupervisedGrouped(false)}>Reset</button>
          </div>

          <p className="m3-type-desc">Similar points form groups. Distance shows which points belong together.</p>
        </article>

        <article className="m3-type-card m3-type-card--story">
          <div className="m3-type-title">Reinforcement Learning</div>
          <p>Signal: reward</p>
          <p>The system tries actions and learns from results.</p>

          <div className="m3-reward-track">
            {RL_STEPS.map((item, index) => (
              <div
                key={item.label}
                className={`m3-reward-step${reinforcementStage >= index + 1 ? ` is-active ${item.reward.startsWith('+') ? 'is-good' : 'is-bad'}` : ''}`}
              >
                <strong>{item.label}</strong>
                <span>{reinforcementStage >= index + 1 ? item.reward : '...'}</span>
              </div>
            ))}
          </div>

          <div className="m3-mini-weights">
            {Object.entries(reinforcementValues).map(([action, value]) => (
              <div key={action} className={`m3-mini-weights__row${bestMove === action ? ' is-best' : ''}`}>
                <span>{action}</span>
                <strong>{value.toFixed(1)}</strong>
              </div>
            ))}
          </div>

          <div className="m3-mini-callout">
            <strong>Best Action</strong>
            <span>{bestMove}</span>
          </div>

          <div className="m3-controls">
            <button className="m3-btn" onClick={() => setReinforcementStage(1)}>Try Action</button>
            <button className="m3-btn" onClick={() => setReinforcementStage(2)}>Show Reward</button>
            <button className="m3-btn" onClick={() => setReinforcementStage(3)}>Update Choice</button>
            <button className="m3-btn" onClick={() => setReinforcementStage(0)}>Reset</button>
          </div>

          <p className="m3-type-desc">Rewards shape future actions.</p>
        </article>
      </div>

      <div className="m3-controls">
        <button type="button" className="m3-btn m3-btn--primary" onClick={onJumpToSectionC}>
          Open the hands-on labs
        </button>
      </div>
    </section>
  )
}

export default LearningTypes
