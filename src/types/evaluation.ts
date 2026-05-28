export type EvaluationSyncStatus = 'idle' | 'syncing' | 'synced' | 'failed'

export interface EvaluationState {
  submissionStatus: EvaluationSyncStatus
  lastAttemptId: string | null
}
