import { useEffect, useState } from 'react'
import KnowledgeQuestion from './KnowledgeQuestion'

export default function KnowledgeCheckSection({
  headingRef,
  questions,
  answers,
  onAnswerChange,
  onBack,
  onSubmit,
  errorMessage,
}) {
  const firstUnansweredIndex = questions.findIndex((question) => !answers[question.id])
  const [activeIndex, setActiveIndex] = useState(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0)

  useEffect(() => {
    if (firstUnansweredIndex >= 0) {
      setActiveIndex((current) => Math.min(current, questions.length - 1))
    }
  }, [firstUnansweredIndex, questions.length])

  const question = questions[activeIndex]
  const isLastQuestion = activeIndex === questions.length - 1
  const allQuestionsAnswered = questions.every((item) => Boolean(answers[item.id]))

  return (
    <section className="ce-panel" aria-labelledby="knowledge-check-heading">
      <div className="ce-panel-head">
        <h2 id="knowledge-check-heading" ref={headingRef} tabIndex={-1}>Knowledge Check</h2>
        <p>Answer each question based on the three modules.</p>
      </div>

      <div className="ce-question-nav" aria-label="Knowledge check question navigation">
        {questions.map((item, index) => {
          const isActive = index === activeIndex
          const isAnswered = Boolean(answers[item.id])

          return (
            <button
              key={item.id}
              type="button"
              className={`ce-question-nav-btn${isActive ? ' is-active' : ''}${isAnswered ? ' is-answered' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-current={isActive ? 'step' : undefined}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <KnowledgeQuestion
        question={question}
        questionNumber={activeIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={answers[question.id] || null}
        onSelect={onAnswerChange}
      />

      {errorMessage && <p className="ce-inline-error" role="alert">{errorMessage}</p>}

      <div className="ce-actions">
        <button type="button" className="shared-btn shared-btn-secondary" onClick={onBack}>
          Back
        </button>
        <div className="ce-actions-group">
          <button
            type="button"
            className="shared-btn shared-btn-ghost"
            onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
            disabled={activeIndex === 0}
          >
            Previous Question
          </button>
          {!isLastQuestion ? (
            <button
              type="button"
              className="shared-btn shared-btn-primary"
              onClick={() => setActiveIndex((current) => Math.min(questions.length - 1, current + 1))}
            >
              Next Question
            </button>
          ) : (
            <button
              type="button"
              className="shared-btn shared-btn-primary"
              onClick={onSubmit}
              disabled={!allQuestionsAnswered}
            >
              Submit Evaluation
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
