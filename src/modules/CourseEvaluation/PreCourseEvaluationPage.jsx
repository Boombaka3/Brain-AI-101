import { useEffect, useRef, useState } from 'react'
import LikertFeedbackSection from './components/feedback/LikertFeedbackSection'
import PreCourseEvaluationIntro from './components/feedback/PreCourseEvaluationIntro'
import { preCourseLikertQuestions } from './data/courseEvaluationData'
import { areLikertQuestionsComplete } from './lib/courseEvaluationLogic'
import {
  createPreCourseEvaluationAttempt,
  loadPreCourseEvaluationAttempt,
  markPreCourseEvaluationSkipped,
  savePreCourseEvaluationAttempt,
} from './lib/courseEvaluationStorage'
import './courseEvaluation.css'

function hasSavedResponses(attempt) {
  return Object.keys(attempt?.likertResponses || {}).length > 0 || Boolean(attempt?.openResponse)
}

export default function PreCourseEvaluationPage({ onBack, onContinue }) {
  const initialAttempt = loadPreCourseEvaluationAttempt() || createPreCourseEvaluationAttempt()
  const [attempt, setAttempt] = useState(initialAttempt)
  const [hasStarted, setHasStarted] = useState(!initialAttempt.completedAt && hasSavedResponses(initialAttempt))
  const [errorMessage, setErrorMessage] = useState('')
  const headingRef = useRef(null)

  useEffect(() => {
    if (hasStarted) {
      headingRef.current?.focus()
    }
  }, [hasStarted])

  const updateAttempt = (updater) => {
    setAttempt((current) => {
      const nextAttempt = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      return savePreCourseEvaluationAttempt(nextAttempt)
    })
  }

  const handleStart = () => {
    setHasStarted(true)
    setErrorMessage('')
  }

  const handleLikertChange = (questionId, value) => {
    setErrorMessage('')
    updateAttempt((current) => ({
      ...current,
      likertResponses: {
        ...current.likertResponses,
        [questionId]: value,
      },
    }))
  }

  const handleSkip = () => {
    const skippedAttempt = markPreCourseEvaluationSkipped()
    setAttempt(skippedAttempt)
    onContinue?.()
  }

  const handleSubmit = () => {
    if (!areLikertQuestionsComplete(preCourseLikertQuestions, attempt.likertResponses)) {
      setErrorMessage('Please answer all rating questions or choose Skip for Now.')
      return
    }

    const completedAttempt = savePreCourseEvaluationAttempt({
      ...attempt,
      skipped: false,
      completedAt: new Date().toISOString(),
      source: 'pre-course',
      version: 1,
    })

    setAttempt(completedAttempt)
    onContinue?.()
  }

  return (
    <div className="ce-page">
      <div className="ce-shell">
        <div className="ce-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={onBack}>
            Back to Home
          </button>
        </div>

        <PreCourseEvaluationIntro started={hasStarted} />

        {!hasStarted ? (
          <section className="ce-panel" aria-labelledby="pre-course-begin-heading">
            <div className="ce-panel-head">
              <h2 id="pre-course-begin-heading">Before You Begin</h2>
              <p>
                This step is optional.
              </p>
              <p>
                Rate how strongly you agree with each statement. This helps compare what learners know before and after the course.
              </p>
            </div>

            <div className="ce-actions">
              <button type="button" className="shared-btn shared-btn-secondary" onClick={handleSkip}>
                Skip for Now
              </button>
              <button type="button" className="shared-btn shared-btn-primary" onClick={handleStart}>
                Start Evaluation
              </button>
            </div>
          </section>
        ) : (
          <LikertFeedbackSection
            sectionId="pre-course-likert-heading"
            headingRef={headingRef}
            title="Before You Begin"
            helperText="Rate how strongly you agree with each statement. This helps compare what learners know before and after the course."
            questions={preCourseLikertQuestions}
            responses={attempt.likertResponses}
            onChange={handleLikertChange}
            errorMessage={errorMessage}
            onNext={handleSubmit}
            primaryActionLabel="Submit and Start Module 1"
            secondaryActionLabel="Skip for Now"
            onSecondaryAction={handleSkip}
          />
        )}
      </div>
    </div>
  )
}
