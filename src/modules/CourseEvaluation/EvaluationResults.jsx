export default function EvaluationResults({
  headingRef,
  attempt,
  results,
  onRetake,
  onContinue,
}) {
  const breakdownItems = Object.values(results.moduleBreakdown)

  return (
    <section className="ce-panel ce-results-panel" aria-labelledby="results-heading">
      <div className="ce-panel-head">
        <h2 id="results-heading" ref={headingRef} tabIndex={-1}>Your Results</h2>
        <p>Review your score and continue to the completion page.</p>
      </div>

      <div className="ce-results-summary">
        <div className="ce-score-card">
          <span className="ce-score-label">Knowledge check score</span>
          <strong>{results.score} / {results.maxScore}</strong>
          <p>{results.passed ? 'Nice work. You cleared the current passing mark.' : 'You can review the explanations below and retake the knowledge check if you want another try.'}</p>
        </div>

        <div className="ce-save-card">
          <span className="ce-score-label">Saved status</span>
          <strong>{attempt.completedAt ? 'Saved' : 'In progress'}</strong>
          <p>Your feedback and quiz results are stored in this browser for the completion handoff.</p>
        </div>
      </div>

      {breakdownItems.length > 0 && (
        <div className="ce-breakdown">
          <h3>Module breakdown</h3>
          <div className="ce-breakdown-grid">
            {breakdownItems.map((item) => (
              <div key={item.module} className="ce-breakdown-card">
                <span>{item.label}</span>
                <strong>{item.correct} / {item.total}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ce-results-list" aria-live="polite">
        {results.questionResults.map((item, index) => (
          <article key={item.id} className={`ce-result-item${item.isCorrect ? ' is-correct' : ' is-incorrect'}`}>
            <div className="ce-result-head">
              <div>
                <span className="ce-result-kicker">Question {index + 1}</span>
                <h3>{item.question}</h3>
              </div>
              <span className={`ce-result-badge${item.isCorrect ? ' is-correct' : ' is-incorrect'}`}>
                {item.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="ce-result-meta">
              Your answer: <strong>{item.selectedAnswer || 'No answer'}</strong>
              {' '}| Correct answer: <strong>{item.correctAnswer}</strong>
            </p>
            <p className="ce-result-explanation">{item.explanation}</p>
          </article>
        ))}
      </div>

      <div className="ce-actions">
        <button type="button" className="shared-btn shared-btn-secondary" onClick={onRetake}>
          Retake Knowledge Check
        </button>
        <button type="button" className="shared-btn shared-btn-primary" onClick={onContinue}>
          Continue to Completion Page
        </button>
      </div>
    </section>
  )
}
