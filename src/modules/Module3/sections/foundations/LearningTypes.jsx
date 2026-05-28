import { useState } from 'react'

const learningGames = [
  {
    id: 'supervised',
    label: 'Supervised learning',
    title: 'Check the Answer',
    mechanism: 'The model makes a guess. Then it sees the correct answer and measures the error.',
    flow: ['Guess', 'Correct answer', 'Error'],
    example: [
      'Prediction: dog',
      'Correct answer: cat',
      'Feedback: wrong answer, adjust',
    ],
    marker: '✓',
  },
  {
    id: 'unsupervised',
    label: 'Unsupervised learning',
    title: 'Find the Pattern',
    mechanism: 'There is no answer key. The model groups examples that look similar.',
    flow: ['Examples', 'Similar groups', 'Pattern found'],
    example: [
      'Round shapes together',
      'Sharp shapes together',
    ],
    marker: '◎',
  },
  {
    id: 'reinforcement',
    label: 'Reinforcement learning',
    title: 'Choose and Learn',
    mechanism: 'The model tries an action. A reward or penalty tells it whether that action helped.',
    flow: ['Action', 'Result', 'Better next choice'],
    example: [
      'Move toward goal: +1',
      'Hit wall: -1',
    ],
    marker: '→',
  },
]

function LearningTypes() {
  const [selectedGame, setSelectedGame] = useState('supervised')

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">B. THREE FEEDBACK GAMES</p>
        <h2>What kind of clue does the model get?</h2>
        <p className="m3-section-subtitle">
          A model can learn from different kinds of feedback. Try each one and notice what kind of clue the model receives.
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
                <div className="m3-feedback-game__top">
                  <span className="m3-feedback-game__marker" aria-hidden="true">{game.marker}</span>
                  <span className="m3-feedback-game__label">{game.label}</span>
                </div>

                <div className="m3-feedback-game__copy">
                  <h3>{game.title}</h3>
                  <p>{game.mechanism}</p>
                </div>

                <div className="m3-feedback-game__flow" aria-label={`${game.title} flow`}>
                  {game.flow.map((step, index) => (
                    <div key={step} className="m3-feedback-game__flow-item">
                      <span className="m3-feedback-game__chip">{step}</span>
                      {index < game.flow.length - 1 ? <span className="m3-feedback-game__arrow" aria-hidden="true">→</span> : null}
                    </div>
                  ))}
                </div>

                <div className={`m3-feedback-game__example${isActive ? ' is-visible' : ''}`}>
                  <p className="m3-feedback-game__example-label">Example</p>
                  <div className="m3-feedback-game__example-list">
                    {game.example.map((line) => (
                      <span key={line} className="m3-feedback-game__example-chip">{line}</span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="m3-learning-type-bridge m3-learning-type-bridge--compact">
          <p>For the rest of this module, we focus on the first game: using error to update weights.</p>
        </div>
      </div>
    </section>
  )
}

export default LearningTypes
