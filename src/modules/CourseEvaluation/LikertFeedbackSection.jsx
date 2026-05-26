const SCALE_OPTIONS = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Not sure' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

export default function LikertFeedbackSection({
  sectionId = 'course-feedback-heading',
  headingRef,
  title = 'Course Feedback',
  helperText = 'Rate how strongly you agree with each statement.',
  questions,
  responses,
  onChange,
  errorMessage,
  onNext,
  primaryActionLabel = 'Next',
  secondaryActionLabel = '',
  onSecondaryAction,
}) {
  return (
    <section className="ce-panel" aria-labelledby={sectionId}>
      <div className="ce-panel-head">
        <h2 id={sectionId} ref={headingRef} tabIndex={-1}>{title}</h2>
        <p>{helperText}</p>
      </div>

      <div className="ce-scale-legend" aria-label="Likert scale labels">
        {SCALE_OPTIONS.map((option) => (
          <span key={option.value}>
            <strong>{option.value}</strong> {option.label}
          </span>
        ))}
      </div>

      <div className="ce-likert-list">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="ce-likert-row">
            <legend>
              <span className="ce-question-number">{index + 1}</span>
              <span>{question.prompt}</span>
            </legend>

            <div className="ce-likert-options" role="radiogroup" aria-label={question.prompt}>
              {SCALE_OPTIONS.map((option) => {
                const checked = Number(responses[question.id]) === option.value

                return (
                  <label key={option.value} className={`ce-scale-option${checked ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={() => onChange(question.id, option.value)}
                      aria-label={`${question.prompt} ${option.value} ${option.label}`}
                    />
                    <span className="ce-scale-value">{option.value}</span>
                    <span className="ce-scale-copy">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {errorMessage && <p className="ce-inline-error" role="alert">{errorMessage}</p>}

      <div className="ce-actions">
        {secondaryActionLabel && onSecondaryAction ? (
          <button type="button" className="shared-btn shared-btn-secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </button>
        ) : <span />}
        <button type="button" className="shared-btn shared-btn-primary" onClick={onNext}>
          {primaryActionLabel}
        </button>
      </div>
    </section>
  )
}
