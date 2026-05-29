import { useEffect, useRef, useState } from 'react'
import CourseEvaluationIntro from './components/shared/CourseEvaluationIntro'
import LikertFeedbackSection from './components/feedback/LikertFeedbackSection'
import OpenFeedbackSection from './components/feedback/OpenFeedbackSection'
import KnowledgeCheckSection from './components/knowledge/KnowledgeCheckSection'
import EvaluationResults from './components/results/EvaluationResults'
import { likertQuestions, openEndedQuestions, knowledgeQuestions } from './data/courseEvaluationData'
import { areKnowledgeQuestionsComplete, areLikertQuestionsComplete, calculateKnowledgeResults } from './lib/courseEvaluationLogic'
import { createEvaluationAttempt, loadEvaluationAttempt, saveEvaluationAttempt, submitEvaluationAttempt } from './lib/courseEvaluationStorage'
import {
  hydrateEvaluationState,
  selectEvaluationAttempt,
  selectEvaluationCurrentStep,
  selectEvaluationHydrated,
  setEvaluationStep,
  updateEvaluationAttempt,
} from '../../store/courseEvaluation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import './courseEvaluation.css'

const SUBMISSION_SCHEMA_VERSION = 'brain-ai-101-course-evaluation.v1'
const SUBMISSION_SOURCE = 'course-evaluation'

function buildSubmissionPayload(attempt) {
  return {
    schemaVersion: SUBMISSION_SCHEMA_VERSION,
    sessionId: attempt.attemptId,
    source: SUBMISSION_SOURCE,
    submittedAt: attempt.completedAt || new Date().toISOString(),
    quizAnswers: attempt.quizAnswers || {},
    summary: {
      attemptId: attempt.attemptId,
      startedAt: attempt.startedAt || null,
      completedAt: attempt.completedAt || null,
      likertResponses: attempt.likertResponses || {},
      openResponses: attempt.openResponses || {},
      score: attempt.score,
      maxScore: attempt.maxScore,
      moduleBreakdown: attempt.moduleBreakdown || {},
      passed: attempt.passed,
    },
  }
}

async function submitEvaluationToDropbox(payload) {
  const response = await fetch('/api/submit-evaluation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.ok) {
    throw new Error('We saved your results in this browser, but Dropbox upload did not finish. Please try again.')
  }

  return Array.isArray(data.files) ? data.files : []
}

function inferStep(attempt) {
  if (attempt?.completedAt) return 'results'
  if (!attempt || !areLikertQuestionsComplete(likertQuestions, attempt.likertResponses)) return 'feedback'
  if (Object.keys(attempt.quizAnswers || {}).length > 0) return 'knowledge'
  return 'reflection'
}

function completedStepsFor(currentStep) {
  const steps = ['feedback', 'reflection', 'knowledge', 'results']
  const currentIndex = steps.indexOf(currentStep)
  return new Set(steps.slice(0, currentIndex))
}

export default function CourseEvaluationPage({ onBack, onContinue }) {
  const dispatch = useAppDispatch()
  const attempt = useAppSelector(selectEvaluationAttempt)
  const currentStep = useAppSelector(selectEvaluationCurrentStep)
  const hydrated = useAppSelector(selectEvaluationHydrated)
  const [feedbackError, setFeedbackError] = useState('')
  const [knowledgeError, setKnowledgeError] = useState('')
  const [isRetryingUpload, setIsRetryingUpload] = useState(false)

  const feedbackHeadingRef = useRef(null)
  const reflectionHeadingRef = useRef(null)
  const knowledgeHeadingRef = useRef(null)
  const resultsHeadingRef = useRef(null)

  useEffect(() => {
    if (hydrated) {
      return
    }

    const existingAttempt = loadEvaluationAttempt()
    const nextAttempt = existingAttempt || createEvaluationAttempt()
    dispatch(
      hydrateEvaluationState({
        attempt: nextAttempt,
        currentStep: inferStep(nextAttempt),
      }),
    )
  }, [dispatch, hydrated])

  useEffect(() => {
    const headingMap = {
      feedback: feedbackHeadingRef,
      reflection: reflectionHeadingRef,
      knowledge: knowledgeHeadingRef,
      results: resultsHeadingRef,
    }

    headingMap[currentStep]?.current?.focus()
  }, [currentStep])

  if (!attempt) {
    return <div className="ce-page" />
  }

  const results = attempt.completedAt
    ? calculateKnowledgeResults(knowledgeQuestions, attempt.quizAnswers)
    : null

  const updateAttempt = (updater) => {
    const nextAttempt = typeof updater === 'function' ? updater(attempt) : { ...attempt, ...updater }
    const savedAttempt = saveEvaluationAttempt(nextAttempt)
    dispatch(updateEvaluationAttempt(savedAttempt))
    return savedAttempt
  }

  const syncCompletedAttempt = async (completedAttempt) => {
    setIsRetryingUpload(true)
    const syncingAttempt = updateAttempt({
      remoteSubmissionStatus: 'syncing',
      remoteSubmissionError: '',
    })

    try {
      const files = await submitEvaluationToDropbox(buildSubmissionPayload(completedAttempt || syncingAttempt))
      updateAttempt({
        remoteSubmissionStatus: 'synced',
        remoteSubmissionError: '',
        remoteSubmissionFiles: files,
      })
    } catch (error) {
      updateAttempt({
        remoteSubmissionStatus: 'failed',
        remoteSubmissionError: error instanceof Error && error.message
          ? error.message
          : 'We saved your results in this browser, but Dropbox upload did not finish. Please try again.',
        remoteSubmissionFiles: [],
      })
    } finally {
      setIsRetryingUpload(false)
    }
  }

  const handleLikertChange = (questionId, value) => {
    setFeedbackError('')
    updateAttempt((current) => ({
      ...current,
      likertResponses: {
        ...current.likertResponses,
        [questionId]: value,
      },
    }))
  }

  const handleOpenResponseChange = (questionId, value) => {
    updateAttempt((current) => ({
      ...current,
      openResponses: {
        ...current.openResponses,
        [questionId]: value,
      },
    }))
  }

  const handleQuizAnswerChange = (questionId, answer) => {
    setKnowledgeError('')
    updateAttempt((current) => ({
      ...current,
      quizAnswers: {
        ...current.quizAnswers,
        [questionId]: answer,
      },
    }))
  }

  const handleFeedbackNext = () => {
    if (!areLikertQuestionsComplete(likertQuestions, attempt.likertResponses)) {
      setFeedbackError('Please answer all six feedback questions before continuing.')
      return
    }

    dispatch(setEvaluationStep('reflection'))
  }

  const handleKnowledgeSubmit = async () => {
    if (!areKnowledgeQuestionsComplete(knowledgeQuestions, attempt.quizAnswers)) {
      setKnowledgeError('Please answer all ten knowledge-check questions before submitting.')
      return
    }

    const nextResults = calculateKnowledgeResults(knowledgeQuestions, attempt.quizAnswers)
    const submittedAttempt = submitEvaluationAttempt({
      ...attempt,
      score: nextResults.score,
      maxScore: nextResults.maxScore,
      moduleBreakdown: nextResults.moduleBreakdown,
      passed: nextResults.passed,
      remoteSubmissionStatus: 'syncing',
      remoteSubmissionError: '',
      remoteSubmissionFiles: [],
    })

    dispatch(updateEvaluationAttempt(submittedAttempt))
    dispatch(setEvaluationStep('results'))
    await syncCompletedAttempt(submittedAttempt)
  }

  const handleRetryUpload = async () => {
    if (!attempt?.completedAt || isRetryingUpload) {
      return
    }

    await syncCompletedAttempt(attempt)
  }

  const handleRetake = () => {
    const nextAttempt = createEvaluationAttempt({
      likertResponses: attempt.likertResponses,
      openResponses: attempt.openResponses,
    })

    dispatch(updateEvaluationAttempt(saveEvaluationAttempt(nextAttempt)))
    setKnowledgeError('')
    dispatch(setEvaluationStep('knowledge'))
  }

  return (
    <div className="ce-page">
      <div className="ce-shell">
        <div className="ce-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={currentStep === 'feedback' ? onBack : () => dispatch(setEvaluationStep('feedback'))}>
            {currentStep === 'feedback' ? 'Back to Module 3' : 'Back to Feedback'}
          </button>
        </div>

        <CourseEvaluationIntro
          currentStep={currentStep}
          completedSteps={completedStepsFor(currentStep)}
        />

        {currentStep === 'feedback' && (
          <LikertFeedbackSection
            headingRef={feedbackHeadingRef}
            questions={likertQuestions}
            responses={attempt.likertResponses}
            onChange={handleLikertChange}
            errorMessage={feedbackError}
            onNext={handleFeedbackNext}
          />
        )}

        {currentStep === 'reflection' && (
          <OpenFeedbackSection
            headingRef={reflectionHeadingRef}
            questions={openEndedQuestions}
            responses={attempt.openResponses}
            onChange={handleOpenResponseChange}
            onBack={() => dispatch(setEvaluationStep('feedback'))}
            onNext={() => dispatch(setEvaluationStep('knowledge'))}
          />
        )}

        {currentStep === 'knowledge' && (
          <KnowledgeCheckSection
            headingRef={knowledgeHeadingRef}
            questions={knowledgeQuestions}
            answers={attempt.quizAnswers}
            onAnswerChange={handleQuizAnswerChange}
            onBack={() => dispatch(setEvaluationStep('reflection'))}
            onSubmit={handleKnowledgeSubmit}
            errorMessage={knowledgeError}
          />
        )}

        {currentStep === 'results' && results && (
          <EvaluationResults
            headingRef={resultsHeadingRef}
            attempt={attempt}
            results={results}
            isRetryingUpload={isRetryingUpload}
            onRetryUpload={handleRetryUpload}
            onRetake={handleRetake}
            onContinue={onContinue}
          />
        )}
      </div>
    </div>
  )
}
