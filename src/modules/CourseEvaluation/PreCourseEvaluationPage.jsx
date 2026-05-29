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
import {
  completePreCourseEvaluation,
  hydratePreCourseEvaluation,
  selectPreCourseEvaluationState,
  skipPreCourseEvaluation,
  startPreCourseEvaluation,
  updatePreCourseEvaluation,
} from '../../store/preCourseEvaluation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import './courseEvaluation.css'

function hasSavedResponses(attempt) {
  return Object.keys(attempt?.likertResponses || {}).length > 0 || Boolean(attempt?.openResponse)
}

export default function PreCourseEvaluationPage({ onBack, onContinue }) {
  const dispatch = useAppDispatch()
  const preCourseState = useAppSelector(selectPreCourseEvaluationState)
  const {
    attemptId,
    startedAt,
    completedAt,
    skipped,
    likertResponses,
    openResponse,
    status,
    hydrated,
  } = preCourseState
  const [errorMessage, setErrorMessage] = useState('')
  const headingRef = useRef(null)
  const attempt = {
    attemptId,
    startedAt,
    completedAt,
    skipped,
    likertResponses,
    openResponse,
    source: 'pre-course',
    version: 1,
  }
  const hasStarted = status === 'draft' || (!completedAt && hasSavedResponses(attempt))

  useEffect(() => {
    if (!hydrated) {
      dispatch(hydratePreCourseEvaluation(loadPreCourseEvaluationAttempt()))
    }
  }, [dispatch, hydrated])

  useEffect(() => {
    if (hasStarted) {
      headingRef.current?.focus()
    }
  }, [hasStarted])

  const handleStart = () => {
    const savedAttempt = savePreCourseEvaluationAttempt(
      attemptId
        ? attempt
        : createPreCourseEvaluationAttempt({
            likertResponses,
            openResponse,
          }),
    )

    dispatch(startPreCourseEvaluation(savedAttempt))
    setErrorMessage('')
  }

  const handleLikertChange = (questionId, value) => {
    setErrorMessage('')

    const savedAttempt = savePreCourseEvaluationAttempt({
      ...attempt,
      likertResponses: {
        ...likertResponses,
        [questionId]: value,
      },
    })

    dispatch(updatePreCourseEvaluation(savedAttempt))
  }

  const handleSkip = () => {
    const skippedAttempt = markPreCourseEvaluationSkipped()
    dispatch(skipPreCourseEvaluation(skippedAttempt))
    onContinue?.()
  }

  const handleSubmit = () => {
    if (!areLikertQuestionsComplete(preCourseLikertQuestions, likertResponses)) {
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

    dispatch(completePreCourseEvaluation(completedAttempt))
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
