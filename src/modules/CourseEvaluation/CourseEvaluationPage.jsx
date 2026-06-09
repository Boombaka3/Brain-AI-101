import { useEffect, useRef, useState } from 'react'
import CourseEvaluationIntro from './components/shared/CourseEvaluationIntro'
import LikertFeedbackSection from './components/feedback/LikertFeedbackSection'
import OpenFeedbackSection from './components/feedback/OpenFeedbackSection'
import KnowledgeCheckSection from './components/knowledge/KnowledgeCheckSection'
import EvaluationResults from './components/results/EvaluationResults'
import { likertQuestions, openEndedQuestions, knowledgeQuestions } from './data/courseEvaluationData'
import { areKnowledgeQuestionsComplete, areLikertQuestionsComplete, calculateKnowledgeResults } from './lib/courseEvaluationLogic'
import { createEvaluationAttempt, getOrCreateSessionId, loadEvaluationAttempt, saveEvaluationAttempt, saveSubmissionToLocalStorage, submitEvaluationAttempt } from './lib/courseEvaluationStorage'
import {
  hydrateEvaluationState,
  selectEvaluationAttempt,
  selectEvaluationCurrentStep,
  selectEvaluationHydrated,
  setEvaluationStep,
  updateEvaluationAttempt,
} from '../../store/courseEvaluation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useSubmitQuizAttempt } from '../../hooks/useSubmitQuizAttempt'
import { useSubmitEvaluation } from '../../hooks/useSubmitEvaluation'
import './courseEvaluation.css'

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
  const { submit: submitQuizAttempt } = useSubmitQuizAttempt()
  const { submit: submitEvaluation, isSubmitting: isSubmittingEvaluation, status: evaluationSubmitStatus } = useSubmitEvaluation()
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

    // Use completedAttempt as base to avoid stale closure overwriting completedAt
    const baseAttempt = completedAttempt || attempt
    const syncingAttempt = saveEvaluationAttempt({
      ...baseAttempt,
      remoteSubmissionStatus: 'syncing',
      remoteSubmissionError: '',
    })
    dispatch(updateEvaluationAttempt(syncingAttempt))

    const quizPayload = {
      sessionId: getOrCreateSessionId(),
      startedAt: baseAttempt.startedAt,
      completedAt: baseAttempt.completedAt,
      selectedAnswers: baseAttempt.quizAnswers || {},
      source: 'course-evaluation',
    }
    const evaluationPayload = {
      sessionId: getOrCreateSessionId(),
      source: 'course-evaluation',
      startedAt: baseAttempt.startedAt,
      completedAt: baseAttempt.completedAt,
      skipped: false,
      likertResponses: baseAttempt.likertResponses || {},
      openResponses: baseAttempt.openResponses || {},
    }

    try {
      const quizResponse = await submitQuizAttempt(quizPayload)

      const evaluationResponse = await submitEvaluation({
        ...evaluationPayload,
        quizAttemptId: quizResponse.attempt.id,
      })

      const syncedAttempt = saveEvaluationAttempt({
        ...baseAttempt,
        score: quizResponse.attempt.score,
        maxScore: quizResponse.attempt.maxScore,
        moduleBreakdown: quizResponse.attempt.moduleBreakdown,
        passed: quizResponse.attempt.passed,
        remoteSubmissionStatus: 'synced',
        remoteSubmissionError: '',
        remoteSubmissionFiles: [quizResponse.attempt.id, evaluationResponse.submission.id],
      })
      dispatch(updateEvaluationAttempt(syncedAttempt))
    } catch (error) {
      saveSubmissionToLocalStorage('quiz', quizPayload)
      saveSubmissionToLocalStorage('evaluation', evaluationPayload)
      const failedAttempt = saveEvaluationAttempt({
        ...baseAttempt,
        remoteSubmissionStatus: 'failed',
        remoteSubmissionError: error instanceof Error && error.message
          ? error.message
          : 'We saved your results in this browser, but the server could not store them yet. Please try again.',
        remoteSubmissionFiles: [],
      })
      dispatch(updateEvaluationAttempt(failedAttempt))
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
            isSubmitting={isRetryingUpload || isSubmittingEvaluation}
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
            submissionStatus={evaluationSubmitStatus}
          />
        )}
      </div>
    </div>
  )
}
