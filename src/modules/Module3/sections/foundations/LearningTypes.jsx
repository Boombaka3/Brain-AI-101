import { useState } from 'react'

const learningGames = [
  {
    id: 'supervised',
    marker: '✓',
    label: 'Supervised Learning',
    title: 'Correct answer as feedback',
    humanLine: 'Like a teacher correcting your answer.',
    mechanism: 'Makes a guess → compares to correct answer → adjusts weights.',
    flowSteps: ['Guess', 'Correct answer', 'Adjust'],
    animClass: 'anim-supervised',
    exampleChips: ['Prediction: 8', 'Correct answer: 3', 'Weights update'],
  },
  {
    id: 'unsupervised',
    marker: '◎',
    label: 'Unsupervised Learning',
    title: 'Similarity as feedback',
    humanLine: 'Like grouping objects by similarity — no labels given.',
    mechanism: 'No labels. Finds structure by grouping similar inputs.',
    flowSteps: ['Examples', 'Similarity', 'Groups'],
    animClass: 'anim-unsupervised',
    exampleChips: ['Similar shapes cluster', 'Similar colors cluster'],
  },
  {
    id: 'reinforcement',
    marker: '→',
    label: 'Reinforcement Learning',
    title: 'Reward as feedback',
    humanLine: 'Like trial and error — you learn from the result.',
    mechanism: 'Tries an action → gets reward or penalty → updates strategy.',
    flowSteps: ['Action', 'Result', 'Update'],
    animClass: 'anim-reinforcement',
    exampleChips: ['Reach goal: +1', 'Hit wall: −1'],
  },
]

export default function LearningTypes({ onJumpToSectionC }) {
  const [selectedGame, setSelectedGame] = useState('supervised')

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">B. THREE FEEDBACK GAMES</p>
        <h2>What kind of clue does the model get?</h2>
        <p className="m3-section-subtitle">
          A model can learn from different kinds of feedback. Select each one and notice what kind of clue the model receives.
        </p>
        <p className="m3-module-callback">
          These are the same weights from Module 2 — learning is how they get adjusted.
        </p>
      </div>

      <div className="m3-section-card m3-feedback-games">
        <div className="m3-feedback-games__grid">
          {learningGames.map((game) => {
            const isActive = selectedGame === game.id

            return (
              <button
                key={game.id}
                type="button"
                className={`m3-feedback-game${isActive ? ' is-active' : ''}`}
                onClick={() => setSelectedGame(game.id)}
                aria-pressed={isActive}
              >
                {/* 1. Marker badge + label */}
                <div className="m3-feedback-game__top">
                  <span className="m3-feedback-game__marker" aria-hidden="true">{game.marker}</span>
                  <span className="m3-feedback-game__label">{game.label}</span>
                </div>

                {/* 2. Title */}
                <div className="m3-feedback-game__copy">
                  <h3>{game.title}</h3>

                  {/* 3. Human comparison line */}
                  <p className="m3-human-line">{game.humanLine}</p>

                  {/* 4. Mechanism */}
                  <p>{game.mechanism}</p>
                </div>

                {/* 5. Flow chips */}
                <div className="m3-feedback-game__flow" aria-label={`${game.title} flow`}>
                  {game.flowSteps.map((step, index) => (
                    <div key={step} className="m3-feedback-game__flow-item">
                      <span className="m3-feedback-game__chip">{step}</span>
                      {index < game.flowSteps.length - 1
                        ? <span className="m3-feedback-game__arrow" aria-hidden="true">→</span>
                        : null}
                    </div>
                  ))}
                </div>

                {/* 6. Animated micro-demo */}
                {game.id === 'supervised' && (
                  <div className={`m3-anim-demo ${game.animClass}${selectedGame === game.id ? ' is-playing' : ''}`}>
                    <div className="anim-sup__digit">8</div>
                    <div className="anim-sup__arrow">→</div>
                    <div className="anim-sup__guess">
                      <span className="anim-sup__guess-label">model guess</span>
                      <span className="anim-sup__guess-val">3</span>
                    </div>
                    <div className="anim-sup__correct">
                      <span className="anim-sup__guess-label">correct</span>
                      <span className="anim-sup__correct-val">8</span>
                    </div>
                    <div className="anim-sup__feedback anim-sup__feedback--wrong">✗ wrong</div>
                    <div className="anim-sup__feedback anim-sup__feedback--right">✓ correct: 8</div>
                  </div>
                )}

                {game.id === 'unsupervised' && (
                  <div className={`m3-anim-demo ${game.animClass}${selectedGame === game.id ? ' is-playing' : ''}`}>
                    <svg className="anim-unsup__svg" viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
                      {/* group 0 — will cluster left */}
                      <circle className="anim-unsup__dot" data-group="0" cx="30" cy="20" r="7"/>
                      <circle className="anim-unsup__dot" data-group="0" cx="55" cy="45" r="7"/>
                      <circle className="anim-unsup__dot" data-group="0" cx="25" cy="65" r="7"/>
                      {/* group 1 — will cluster center */}
                      <circle className="anim-unsup__dot" data-group="1" cx="90" cy="15" r="7"/>
                      <circle className="anim-unsup__dot" data-group="1" cx="110" cy="50" r="7"/>
                      <circle className="anim-unsup__dot" data-group="1" cx="80" cy="75" r="7"/>
                      {/* group 2 — will cluster right */}
                      <circle className="anim-unsup__dot" data-group="2" cx="145" cy="25" r="7"/>
                      <circle className="anim-unsup__dot" data-group="2" cx="160" cy="55" r="7"/>
                      <circle className="anim-unsup__dot" data-group="2" cx="135" cy="70" r="7"/>
                    </svg>
                  </div>
                )}

                {game.id === 'reinforcement' && (
                  <div className={`m3-anim-demo ${game.animClass}${selectedGame === game.id ? ' is-playing' : ''}`}>
                    <div className="anim-rl__track">
                      <div className="anim-rl__cell anim-rl__cell--wall" data-pos="0">✗</div>
                      <div className="anim-rl__cell" data-pos="1"></div>
                      <div className="anim-rl__cell" data-pos="2"></div>
                      <div className="anim-rl__cell" data-pos="3"></div>
                      <div className="anim-rl__cell anim-rl__cell--goal" data-pos="4">★</div>
                    </div>
                    <div className="anim-rl__agent"></div>
                    <div className="anim-rl__badge anim-rl__badge--miss">−1</div>
                    <div className="anim-rl__badge anim-rl__badge--hit">+1</div>
                  </div>
                )}

                {/* 7. Example area */}
                <div className={`m3-feedback-game__example${isActive ? ' is-visible' : ''}`}>
                  <p className="m3-feedback-game__example-label">Example</p>
                  <div className="m3-feedback-game__example-list">
                    {game.exampleChips.map((chip) => (
                      <span key={chip} className="m3-feedback-game__example-chip">{chip}</span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="m3-learning-type-bridge m3-learning-type-bridge--compact">
          <p className="m3-bridge-main">
            All three use feedback — they differ in <strong>what kind</strong>.
          </p>
          <p className="m3-bridge-sub">
            The rest of this module follows supervised learning: the error signal is the most direct path through a network.
          </p>
        </div>
      </div>
    </section>
  )
}
