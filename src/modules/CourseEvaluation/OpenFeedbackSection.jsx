export default function OpenFeedbackSection({
  headingRef,
  questions,
  responses,
  onChange,
  onBack,
  onNext,
}) {
  return (
    <section className="ce-panel" aria-labelledby="open-reflection-heading">
      <div className="ce-panel-head">
        <h2 id="open-reflection-heading" ref={headingRef} tabIndex={-1}>Open Reflection</h2>
        <p>Write short responses. Your feedback helps improve the website and activities.</p>
      </div>

      <div className="ce-open-grid">
        {questions.map((question) => (
          <label key={question.id} className="ce-open-item">
            <span>{question.prompt}</span>
            <textarea
              value={responses[question.id] || ''}
              onChange={(event) => onChange(question.id, event.target.value)}
              rows={4}
            />
          </label>
        ))}
      </div>

      <div className="ce-actions">
        <button type="button" className="shared-btn shared-btn-secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="shared-btn shared-btn-primary" onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  )
}
