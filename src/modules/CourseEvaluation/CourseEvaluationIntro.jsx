const STEP_LABELS = {
  feedback: 'Feedback',
  reflection: 'Reflection',
  knowledge: 'Knowledge Check',
  results: 'Results',
}

export default function CourseEvaluationIntro({ currentStep, completedSteps = new Set() }) {
  return (
    <header className="ce-hero">
      <div className="ce-hero-copy">
        <span className="ce-eyebrow">Course Evaluation</span>
        <h1>Course Evaluation</h1>
        <p>
          Show what you learned and share feedback about the course. Review the course, share feedback, and complete a short knowledge check.
        </p>
      </div>

      <div className="ce-progress-strip" aria-label={`Progress: ${STEP_LABELS[currentStep]}`}>
        {Object.entries(STEP_LABELS).map(([step, label], index) => {
          const isActive = currentStep === step
          const isComplete = completedSteps.has(step)

          return (
            <div
              key={step}
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
