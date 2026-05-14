import { useEffect, useRef, useState } from 'react'
import CourseEvaluationIntro from './CourseEvaluationIntro'
import LikertFeedbackSection from './LikertFeedbackSection'
import OpenFeedbackSection from './OpenFeedbackSection'
import KnowledgeCheckSection from './KnowledgeCheckSection'
import EvaluationResults from './EvaluationResults'
import { likertQuestions, openEndedQuestions, knowledgeQuestions } from './courseEvaluationData'
import { areKnowledgeQuestionsComplete, areLikertQuestionsComplete, calculateKnowledgeResults } from './courseEvaluationLogic'
import { createEvaluationAttempt, loadEvaluationAttempt, saveEvaluationAttempt, submitEvaluationAttempt } from './courseEvaluationStorage'
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
  const [attempt, setAttempt] = useState(null)
  const [currentStep, setCurrentStep] = useState('feedback')
  const [feedbackError, setFeedbackError] = useState('')
  const [knowledgeError, setKnowledgeError] = useState('')

  const feedbackHeadingRef = useRef(null)
  const reflectionHeadingRef = useRef(null)
  const knowledgeHeadingRef = useRef(null)
  const resultsHeadingRef = useRef(null)

  useEffect(() => {
    const existingAttempt = loadEvaluationAttempt()
    const nextAttempt = existingAttempt || createEvaluationAttempt()
    setAttempt(nextAttempt)
    setCurrentStep(inferStep(nextAttempt))
  }, [])

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
    setAttempt((current) => {
      const nextAttempt = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      return saveEvaluationAttempt(nextAttempt)
    })
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

    setCurrentStep('reflection')
  }

  const handleKnowledgeSubmit = () => {
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
    })

    setAttempt(submittedAttempt)
    setCurrentStep('results')
  }

  const handleRetake = () => {
    const nextAttempt = createEvaluationAttempt({
      likertResponses: attempt.likertResponses,
      openResponses: attempt.openResponses,
    })

    setAttempt(saveEvaluationAttempt(nextAttempt))
    setKnowledgeError('')
    setCurrentStep('knowledge')
  }

  return (
    <div className="ce-page">
      <div className="ce-shell">
        <div className="ce-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={currentStep === 'feedback' ? onBack : () => setCurrentStep('feedback')}>
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
            onBack={() => setCurrentStep('feedback')}
            onNext={() => setCurrentStep('knowledge')}
          />
        )}

        {currentStep === 'knowledge' && (
          <KnowledgeCheckSection
            headingRef={knowledgeHeadingRef}
            questions={knowledgeQuestions}
            answers={attempt.quizAnswers}
            onAnswerChange={handleQuizAnswerChange}
            onBack={() => setCurrentStep('reflection')}
            onSubmit={handleKnowledgeSubmit}
            errorMessage={knowledgeError}
          />
        )}

        {currentStep === 'results' && results && (
          <EvaluationResults
            headingRef={resultsHeadingRef}
            attempt={attempt}
            results={results}
            onRetake={handleRetake}
            onContinue={onContinue}
          />
        )}
      </div>
    </div>
  )
}
