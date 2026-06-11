import type { RootState } from '../store'

const REQUIRED_MODULES = [
  {
    id: 'module1',
    label: 'Module 1',
    detail: 'Visit all 4 required sections in Biological Neuron.',
    totalSections: 4,
  },
  {
    id: 'module2',
    label: 'Module 2',
    detail: 'Visit all 5 required sections in Pattern Recognition.',
    totalSections: 5,
  },
  {
    id: 'module3',
    label: 'Module 3',
    detail: 'Visit all 6 required sections in Learning to Learn.',
    totalSections: 6,
  },
] as const

export interface CourseCompletionItem {
  id: string
  label: string
  detail: string
  completed: boolean
}

export interface CourseCompletionStatus {
  completedCount: number
  totalCount: number
  isUnlocked: boolean
  items: CourseCompletionItem[]
  missingItems: CourseCompletionItem[]
}

function normalizeVisitedSections(visitedSections: number[] | undefined) {
  if (!Array.isArray(visitedSections)) {
    return []
  }

  return Array.from(new Set(visitedSections)).sort((left, right) => left - right)
}

export function getCourseCompletionStatus(state: RootState): CourseCompletionStatus {
  const items: CourseCompletionItem[] = REQUIRED_MODULES.map((moduleConfig) => {
      const moduleProgress = state.userProgress.modules[moduleConfig.id]
      const visitedSections = normalizeVisitedSections(moduleProgress?.visitedSections)

      return {
        id: moduleConfig.id,
        label: moduleConfig.label,
        detail: moduleConfig.detail,
        completed:
          Boolean(moduleProgress?.completedAt) ||
          visitedSections.length >= moduleConfig.totalSections,
      }
    })

  const missingItems = items.filter((item) => !item.completed)
  const completedCount = items.length - missingItems.length

  return {
    completedCount,
    totalCount: items.length,
    isUnlocked: missingItems.length === 0,
    items,
    missingItems,
  }
}

export const selectCourseCompletionStatus = (state: RootState) => getCourseCompletionStatus(state)
