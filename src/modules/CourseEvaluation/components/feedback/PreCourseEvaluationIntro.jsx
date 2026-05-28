const STEP_LABELS = [
  'Pre-Course Evaluation',
  'Module 1',
]

export default function PreCourseEvaluationIntro({ started }) {
  return (
    <header className="ce-hero">
      <div className="ce-hero-copy">
        <span className="ce-eyebrow">Optional Step</span>
        <h1>Pre-Course Evaluation</h1>
        <p>
          Before starting, answer a short questionnaire about what you already know. You can skip this step and return to the course.
        </p>
      </div>

      <div className="ce-progress-strip" aria-label="Pre-course progress">
        {STEP_LABELS.map((label, index) => {
          const isActive = index === 0
          const isComplete = started && index === 0

          return (
            <div
              key={label}
              className={`ce-progress-step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="ce-progress-index">{index + 1}</span>
              <span className="ce-progress-label">{label}</span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
