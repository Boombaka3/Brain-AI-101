import {
  knowledgeQuestions,
  likertQuestions,
  preCourseLikertQuestions,
} from '../../src/modules/CourseEvaluation/data/courseEvaluationData.js'

export const questionBank = knowledgeQuestions.map((question) => ({
  id: question.id,
  moduleId: question.module,
  section: question.section || null,
  sectionTitle: question.sectionTitle || null,
  concept: question.concept || null,
  prompt: question.question,
  correctOptionId: question.correctAnswer,
  explanation: question.explanation,
  options: question.choices,
}))

export const questionMap = new Map(questionBank.map((question) => [question.id, question]))

export const postCourseLikertIds = new Set(likertQuestions.map((question) => question.id))
export const preCourseLikertIds = new Set(preCourseLikertQuestions.map((question) => question.id))
