import type { AppView } from './app'

export interface ModuleSectionProgress {
  activeIndex: number
  visitedIndices: number[]
}

export interface ModuleProgressState {
  completedViews: AppView[]
  moduleSectionProgress: {
    module1: ModuleSectionProgress
    module2: ModuleSectionProgress
    module3: ModuleSectionProgress
  }
}
