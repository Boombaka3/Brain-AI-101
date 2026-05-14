export const PASSING_SCORE = 7

export const MODULE_LABELS = {
  module1: 'Module 1',
  module2: 'Module 2',
  module3: 'Module 3',
  synthesis: 'Synthesis',
}

export function areLikertQuestionsComplete(questions, responses = {}) {
  return questions.every(({ id }) => Number(responses[id]) >= 1 && Number(responses[id]) <= 5)
}

export function areKnowledgeQuestionsComplete(questions, answers = {}) {
  return questions.every(({ id }) => typeof answers[id] === 'string' && answers[id].length === 1)
}

export function calculateKnowledgeResults(questions, answers = {}) {
  const questionResults = questions.map((question) => {
    const selectedAnswer = answers[question.id] || null
    const isCorrect = selectedAnswer === question.correctAnswer

    return {
      id: question.id,
      module: question.module,
      concept: question.concept,
      question: question.question,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect,
    }
  })

  const score = questionResults.filter((item) => item.isCorrect).length
  const maxScore = questions.length
  const moduleBreakdown = questionResults.reduce((acc, item) => {
    const current = acc[item.module] || {
      module: item.module,
      label: MODULE_LABELS[item.module] || item.module,
      correct: 0,
      total: 0,
    }

    current.total += 1
    if (item.isCorrect) current.correct += 1
    acc[item.module] = current
    return acc
  }, {})

  return {
    score,
    maxScore,
    passed: score >= PASSING_SCORE,
    moduleBreakdown,
    questionResults,
  }
}
