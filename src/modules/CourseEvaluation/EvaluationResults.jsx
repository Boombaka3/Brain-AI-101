import CourseEvaluationQuestionCallback from './CourseEvaluationQuestionCallback'
import CourseEvaluationCnnVisual from './CourseEvaluationCnnVisual'
import { knowledgeQuestions } from './courseEvaluationData'

export default function EvaluationResults({
  headingRef,
  attempt,
  results,
  isRetryingUpload,
  onRetryUpload,
  onRetake,
  onContinue,
}) {
  const breakdownItems = Object.values(results.moduleBreakdown)
  const uploadStatus = attempt.remoteSubmissionStatus || 'idle'
  const showRetry = attempt.completedAt && uploadStatus !== 'synced'
  const uploadStatusLabel = uploadStatus === 'synced'
    ? 'Uploaded to Dropbox'
    : uploadStatus === 'syncing'
      ? 'Uploading to Dropbox...'
      : uploadStatus === 'failed'
        ? 'Saved locally, upload needs retry'
        : 'Saved locally'
  const uploadStatusMessage = uploadStatus === 'synced'
    ? 'Your feedback and quiz results are saved in this browser and uploaded to Dropbox.'
    : uploadStatus === 'syncing'
      ? 'Your feedback and quiz results are saved in this browser while the Dropbox upload finishes.'
      : 'Your feedback and quiz results are stored in this browser for the completion handoff.'

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
          <strong>{attempt.completedAt ? uploadStatusLabel : 'In progress'}</strong>
          <p>{uploadStatusMessage}</p>
          {attempt.remoteSubmissionError && (
            <p className="ce-inline-error">{attempt.remoteSubmissionError}</p>
          )}
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
          (() => {
            const sourceQuestion = knowledgeQuestions.find((question) => question.id === item.id)
            const moduleLabel = sourceQuestion?.module === 'module1'
              ? 'Module 1'
              : sourceQuestion?.module === 'module2'
                ? 'Module 2'
                : 'Module 3'

            return (
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

                {sourceQuestion && (
                  <CourseEvaluationQuestionCallback module={moduleLabel} sectionTitle={sourceQuestion.sectionTitle} />
                )}

                <p className="ce-result-meta">
                  Your answer: <strong>{item.selectedAnswer || 'No answer'}</strong>
                  {' '}| Correct answer: <strong>{item.correctAnswer}</strong>
                </p>

                {sourceQuestion?.visualType && (
                  <CourseEvaluationCnnVisual
                    visualType={sourceQuestion.visualType}
                    visualData={sourceQuestion.visualData}
                    revealAnswer
                    selectedAnswer={item.selectedAnswer}
                    correctAnswer={item.correctAnswer}
                  />
                )}

                <p className="ce-result-explanation">{item.explanation}</p>
              </article>
            )
          })()
        ))}
      </div>

      <div className="ce-actions">
        <div className="ce-actions-group">
          <button type="button" className="shared-btn shared-btn-secondary" onClick={onRetake}>
            Retake Knowledge Check
          </button>
          {showRetry && (
            <button
              type="button"
              className="shared-btn shared-btn-secondary"
              onClick={onRetryUpload}
              disabled={isRetryingUpload || uploadStatus === 'syncing'}
            >
              {isRetryingUpload || uploadStatus === 'syncing' ? 'Retrying Upload...' : 'Retry Dropbox Upload'}
            </button>
          )}
        </div>
        <button type="button" className="shared-btn shared-btn-primary" onClick={onContinue}>
          Continue to Completion Page
        </button>
      </div>
    </section>
  )
}
