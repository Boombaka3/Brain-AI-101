export type AppView =
  | 'landing'
  | 'preCourseEvaluation'
  | 'module1'
  | 'module2'
  | 'module3'
  | 'courseEvaluation'
  | 'completion'

export interface AppState {
  currentView: AppView
}
