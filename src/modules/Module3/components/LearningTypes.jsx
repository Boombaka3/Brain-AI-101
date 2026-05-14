const learningTypes = [
  {
    title: 'Supervised Learning',
    variant: 'supervised',
    question: 'Can the model learn from a known answer?',
    mechanism: [
      'The model makes a prediction.',
      'The target answer is revealed.',
      'The error is measured.',
      'Weights are adjusted so the next prediction moves closer to the target.',
    ],
    rule: 'Use the target answer to correct the prediction.',
    exampleIntro: 'A model sees a handwritten digit.',
    exampleLines: [
      'Prediction: 8',
      'Target: 3',
      'Error: high',
    ],
    exampleOutcome: 'After training, the model becomes more likely to predict 3 for similar digits.',
    human: 'A student solves a physics problem, checks the answer key, finds the mistake, and changes the method used on the next problem.',
    feedback: 'Prediction compared with target.',
    flow: 'Prediction → Target → Error → Weight Update',
  },
  {
    title: 'Unsupervised Learning',
    variant: 'unsupervised',
    question: 'Can the model find structure without answer labels?',
    mechanism: [
      'The model receives data without target answers.',
      'It compares examples to each other.',
      'Examples with similar patterns move closer together.',
      'Examples with different patterns move farther apart.',
    ],
    rule: 'Use similarity to organize the data.',
    exampleIntro: 'A model receives thousands of documents with no labels.',
    exampleLines: [
      'It notices that some documents share vocabulary about medicine, others share vocabulary about finance, and others share vocabulary about sports.',
    ],
    exampleOutcome: 'The model forms groups from patterns in the data.',
    human: 'A researcher receives a box of unknown fossils and sorts them by shape, size, structure, and repeated features before knowing their species.',
    feedback: 'Patterns inside the data.',
    flow: 'Data → Similarity → Groups → Structure',
  },
  {
    title: 'Reinforcement Learning',
    variant: 'reinforcement',
    question: 'Can the model improve by testing actions?',
    mechanism: [
      'The model observes a situation.',
      'It chooses an action.',
      'The action produces a consequence.',
      'Actions that lead to better outcomes become more likely in the future.',
    ],
    rule: 'Use consequences to improve future choices.',
    exampleIntro: 'A robot learns to navigate a room.',
    exampleLines: [
      'Action: move forward',
      'Consequence: blocked path',
      'Action: turn left',
      'Consequence: reaches the goal',
    ],
    exampleOutcome: 'Over time, the robot learns which actions work better in each situation.',
    human: 'A chess player tests a line of moves, loses material, studies the consequence, and avoids that line in future games.',
    feedback: 'Reward, penalty, or delayed consequence.',
    flow: 'Situation → Action → Consequence → Better Strategy',
  },
]

function LearningTypes() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">B. THREE WAYS MACHINES LEARN</p>
        <h2>What kind of feedback drives the learning?</h2>
        <p className="m3-section-subtitle">
          Different learning systems improve by following different feedback rules.
        </p>
      </div>

      <div className="m3-section-card m3-learning-types-intro">
        <p>Machine learning is not one method.</p>
        <p>Each type of learning answers a different question:</p>
        <div className="m3-learning-type-mechanism">
          <p>Does the model receive correct answers?</p>
          <p>Does the model need to find structure by itself?</p>
          <p>Does the model need to choose actions and learn from consequences?</p>
        </div>
        <p>
          The feedback changes, but the deeper mechanism stays the same: experience changes future behavior.
        </p>
      </div>

      <div className="m3-learning-type-grid">
        {learningTypes.map((type) => (
          <article
            key={type.title}
            className={`m3-learning-type-card ${type.variant}`}
          >
            <div className="m3-learning-type-label">{type.title}</div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Central question</p>
              <p className="m3-learning-type-question">{type.question}</p>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Mechanism</p>
              <div className="m3-learning-type-mechanism">
                {type.mechanism.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Rule</p>
              <p className="m3-learning-type-rule">{type.rule}</p>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Example</p>
              <div className="m3-learning-type-example">
                <p>{type.exampleIntro}</p>
                {type.exampleLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>{type.exampleOutcome}</p>
              </div>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Human comparison</p>
              <p className="m3-learning-type-human">{type.human}</p>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Feedback signal</p>
              <p className="m3-learning-type-feedback">{type.feedback}</p>
            </div>

            <div className="m3-learning-type-section">
              <p className="m3-learning-type-section-title">Mini-flow</p>
              <p className="m3-learning-type-flow">{type.flow}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="m3-section-card m3-learning-type-bridge">
        <p>
          The next section is optional advanced practice. After that, the core lesson focuses on supervised learning because it gives the clearest path into error, weight updates, and backpropagation:
        </p>
        <p>prediction → target → error → update.</p>
      </div>
    </section>
  )
}

export default LearningTypes
