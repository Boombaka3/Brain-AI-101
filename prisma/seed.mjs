import { PrismaClient } from '@prisma/client'
import { knowledgeQuestions } from '../src/modules/CourseEvaluation/data/courseEvaluationData.js'

const prisma = new PrismaClient()

const modules = [
  {
    id: 'module1',
    title: 'Biological Neuron',
    description: 'Signal flow, threshold, and the biological basis of the neural metaphor.',
    sortOrder: 1,
  },
  {
    id: 'module2',
    title: 'Pattern Recognition',
    description: 'Artificial neurons, selectivity, activation, and convolution.',
    sortOrder: 2,
  },
  {
    id: 'module3',
    title: 'Learning to Learn',
    description: 'Prediction, error, and feedback-driven learning.',
    sortOrder: 3,
  },
]

async function seedModules() {
  for (const module of modules) {
    await prisma.courseModule.upsert({
      where: { id: module.id },
      update: module,
      create: module,
    })
  }
}

async function seedQuestions() {
  for (const question of knowledgeQuestions) {
    await prisma.quizQuestion.upsert({
      where: { id: question.id },
      update: {
        moduleId: question.module,
        section: question.section || null,
        sectionTitle: question.sectionTitle || null,
        concept: question.concept || null,
        prompt: question.question,
        correctOptionId: question.correctAnswer,
        explanation: question.explanation,
        options: question.choices,
      },
      create: {
        id: question.id,
        moduleId: question.module,
        section: question.section || null,
        sectionTitle: question.sectionTitle || null,
        concept: question.concept || null,
        prompt: question.question,
        correctOptionId: question.correctAnswer,
        explanation: question.explanation,
        options: question.choices,
      },
    })
  }
}

async function main() {
  await seedModules()
  await seedQuestions()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Prisma seed failed', error)
    await prisma.$disconnect()
    process.exit(1)
  })
