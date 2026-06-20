import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useAdminSubmissions } from '../hooks/useAdminSubmissions'
import type { AdminExportType } from '../types/admin'
import '../modules/CourseEvaluation/courseEvaluation.css'
import './adminSubmissions.css'

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatLikertResponses(responses: Record<string, number>) {
  const entries = Object.entries(responses)
  if (entries.length === 0) {
    return 'No ratings'
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(' · ')
}

function matchesSearch(haystack: Array<string | number | null | undefined>, query: string) {
  if (!query) {
    return true
  }

  const normalizedQuery = query.toLowerCase()
  return haystack.some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
}

export default function AdminSubmissionsPage({ onBack }: { onBack: () => void }) {
  const {
    token,
    setToken,
    clearToken,
    load,
    exportCsv,
    data,
    errorMessage,
    status,
    exporting,
    hasStoredToken,
    isLoading,
  } = useAdminSubmissions()
  const [inputValue, setInputValue] = useState(token)
  const [searchText, setSearchText] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'quiz' | 'evaluations' | 'pre-course' | 'post-course'>('all')
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>('newest')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await load(inputValue)
    } catch {
      // Error state is handled inside the hook.
    }
  }

  const handleClearToken = () => {
    clearToken()
    setToken('')
    setInputValue('')
  }

  const handleExport = async (type: AdminExportType) => {
    try {
      await exportCsv(type, inputValue)
    } catch {
      // Error state is handled inside the hook.
    }
  }

  const isEmpty = data && data.quizAttempts.length === 0 && data.evaluations.length === 0
  const canExport = Boolean(inputValue.trim()) && status === 'success' && Boolean(data) && !isLoading && exporting === null

  const filteredData = useMemo(() => {
    if (!data) {
      return null
    }

    const searchQuery = searchText.trim()
    const direction = sortMode === 'newest' ? -1 : 1

    const filteredQuizAttempts = data.quizAttempts
      .filter((attempt) => submissionFilter === 'all' || submissionFilter === 'quiz')
      .filter((attempt) => matchesSearch([
        'quiz attempt',
        attempt.source,
        attempt.sessionId,
        attempt.submittedAt,
        attempt.startedAt,
        attempt.completedAt,
        `${attempt.score}/${attempt.maxScore}`,
        ...Object.values(attempt.moduleBreakdown).map((item) => item.label),
      ], searchQuery))
      .sort((a, b) => direction * (new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()))

    const filteredEvaluations = data.evaluations
      .filter((submission) => {
        if (submissionFilter === 'all' || submissionFilter === 'evaluations') {
          return true
        }

        return submission.source === submissionFilter
      })
      .filter((submission) => matchesSearch([
        'evaluation',
        submission.source,
        submission.sessionId,
        submission.submittedAt,
        submission.startedAt,
        submission.completedAt,
        submission.quizAttemptId,
        formatLikertResponses(submission.likertResponses),
        ...Object.values(submission.openResponses || {}),
      ], searchQuery))
      .sort((a, b) => direction * (new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()))

    return {
      quizAttempts: filteredQuizAttempts,
      evaluations: filteredEvaluations,
      totalVisible: filteredQuizAttempts.length + filteredEvaluations.length,
      totalAvailable:
        (submissionFilter === 'quiz'
          ? data.quizAttempts.length
          : submissionFilter === 'evaluations'
            ? data.evaluations.length
            : submissionFilter === 'pre-course'
              ? data.evaluations.filter((item) => item.source === 'pre-course').length
              : submissionFilter === 'post-course'
                ? data.evaluations.filter((item) => item.source === 'course-evaluation').length
                : data.quizAttempts.length + data.evaluations.length),
    }
  }, [data, searchText, sortMode, submissionFilter])

  const showQuizSection = submissionFilter === 'all' || submissionFilter === 'quiz'
  const showEvaluationSection =
    submissionFilter === 'all' ||
    submissionFilter === 'evaluations' ||
    submissionFilter === 'pre-course' ||
    submissionFilter === 'post-course'

  const clearFilters = () => {
    setSearchText('')
    setSubmissionFilter('all')
    setSortMode('newest')
  }

  return (
    <div className="ce-page">
      <div className="ce-shell admin-submissions-page">
        <div className="ce-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={onBack}>
            Back to Home
          </button>
        </div>

        <section className="ce-hero admin-submissions-hero">
          <div className="ce-hero-copy">
            <span className="ce-eyebrow">Admin Data Access</span>
            <h1>Review submitted quiz and evaluation records</h1>
            <p>
              Enter the admin read token at runtime to inspect stored submissions and export CSV files from the deployed backend.
            </p>
          </div>
        </section>

        <section className="ce-panel admin-submissions-panel">
          <div className="ce-panel-head">
            <h2>Connect to the study database</h2>
            <p>
              The token is stored only in this browser session and is sent as a Bearer token to the protected admin endpoints.
            </p>
          </div>

          <form className="admin-submissions-form" onSubmit={handleSubmit}>
            <label className="admin-submissions-field">
              <span>Admin token</span>
              <input
                type="password"
                value={inputValue}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setInputValue(nextValue)
                  setToken(nextValue)
                }}
                placeholder="Enter ADMIN_READ_TOKEN"
                autoComplete="off"
              />
              <small className="admin-submissions-helper">Stored only for this browser session.</small>
            </label>

              <div className="ce-actions">
                <div className="ce-actions-group">
                  <button type="submit" className="shared-btn shared-btn-primary" disabled={isLoading}>
                    {isLoading ? 'Loading…' : 'Load submissions'}
                  </button>
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={handleClearToken}
                    disabled={isLoading}
                  >
                    Clear token
                  </button>
                </div>
              </div>
          </form>

          {errorMessage ? (
            <p className="ce-inline-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>

        {data ? (
          <>
            <section className="ce-panel admin-submissions-panel">
              <div className="ce-panel-head">
                <h2>Submission summary</h2>
                <p>Use the exports for offline review, or browse the latest records below.</p>
              </div>

              <div className="admin-submissions-summary">
                <article className="admin-summary-card">
                  <span>Quiz attempts</span>
                  <strong>{data.summary.quizAttemptCount}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Evaluations</span>
                  <strong>{data.summary.evaluationCount}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Average quiz score</span>
                  <strong>{data.summary.averageQuizScore}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Passed quizzes</span>
                  <strong>{data.summary.passCount}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Pre-course</span>
                  <strong>{data.summary.preCourseCount}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Post-course</span>
                  <strong>{data.summary.postCourseCount}</strong>
                </article>
              </div>

              <div className="ce-actions">
                <div className="ce-actions-group">
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('quiz')}
                    disabled={!canExport}
                    aria-disabled={!canExport}
                  >
                    {exporting === 'quiz' ? 'Exporting…' : 'Export quiz CSV'}
                  </button>
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('evaluations')}
                    disabled={!canExport}
                    aria-disabled={!canExport}
                  >
                    {exporting === 'evaluations' ? 'Exporting…' : 'Export evaluations CSV'}
                  </button>
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('quiz-detailed')}
                    disabled={!canExport}
                  >
                    {exporting === 'quiz-detailed' ? 'Exporting…' : 'Export detailed quiz CSV'}
                  </button>
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('evaluations-detailed')}
                    disabled={!canExport}
                  >
                    {exporting === 'evaluations-detailed' ? 'Exporting…' : 'Export detailed evaluations CSV'}
                  </button>
                </div>
              </div>
              <p className="admin-export-note">
                Detailed exports expand each answer and Likert response into individual columns — ready to open directly in Google Sheets.
              </p>
            </section>

            <section className="ce-panel admin-submissions-panel">
              <div className="ce-panel-head">
                <h2>Filter loaded results</h2>
                <p>
                  Search and sort the submissions already loaded from the admin endpoint.
                </p>
              </div>

              <div className="admin-filters">
                <label className="admin-filter-field admin-filter-field--search">
                  <span>Search</span>
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search submissions"
                  />
                </label>

                <label className="admin-filter-field">
                  <span>Type</span>
                  <select value={submissionFilter} onChange={(event) => setSubmissionFilter(event.target.value as typeof submissionFilter)}>
                    <option value="all">All</option>
                    <option value="quiz">Quiz Attempts</option>
                    <option value="evaluations">Evaluations</option>
                    <option value="pre-course">Pre-course Evaluations</option>
                    <option value="post-course">Post-course Evaluations</option>
                  </select>
                </label>

                <label className="admin-filter-field">
                  <span>Sort</span>
                  <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </label>

                <div className="admin-filter-actions">
                  <button type="button" className="shared-btn shared-btn-ghost" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              </div>

              <p className="admin-filter-summary">
                Showing {filteredData?.totalVisible ?? 0} of {filteredData?.totalAvailable ?? 0} items in this view
              </p>
            </section>

            {isEmpty ? (
              <section className="ce-panel admin-submissions-panel">
                <div className="ce-panel-head">
                  <h2>No submissions yet</h2>
                  <p>The backend is connected, but there are no stored quiz attempts or evaluations to show yet.</p>
                </div>
              </section>
            ) : (
              <div className="admin-submissions-grid">
                {showQuizSection ? (
                  <section className="ce-panel admin-submissions-panel">
                    <div className="ce-panel-head">
                      <h2>Quiz attempts</h2>
                      <p>Latest knowledge-check submissions, including score and pass status.</p>
                    </div>

                    {filteredData && filteredData.quizAttempts.length === 0 ? (
                      <p className="admin-empty-note">No quiz attempts match the current filters.</p>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Submitted</th>
                              <th>Session</th>
                              <th>Score</th>
                              <th>Passed</th>
                              <th>Source</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData?.quizAttempts.map((attempt) => (
                              <tr key={attempt.id}>
                                <td>{formatDate(attempt.submittedAt)}</td>
                                <td className="admin-mono-cell">{attempt.sessionId}</td>
                                <td>{attempt.score}/{attempt.maxScore}</td>
                                <td>{attempt.passed ? 'Yes' : 'No'}</td>
                                <td>{attempt.source}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ) : null}

                {showEvaluationSection ? (
                  <section className="ce-panel admin-submissions-panel">
                    <div className="ce-panel-head">
                      <h2>Evaluation submissions</h2>
                      <p>Pre-course and post-course responses stored through the database-backed evaluation endpoint.</p>
                    </div>

                    {filteredData && filteredData.evaluations.length === 0 ? (
                      <p className="admin-empty-note">No evaluation submissions match the current filters.</p>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Submitted</th>
                              <th>Session</th>
                              <th>Source</th>
                              <th>Skipped</th>
                              <th>Ratings</th>
                              <th>Quiz link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData?.evaluations.map((submission) => (
                              <tr key={submission.id}>
                                <td>{formatDate(submission.submittedAt)}</td>
                                <td className="admin-mono-cell">{submission.sessionId}</td>
                                <td>{submission.source}</td>
                                <td>{submission.skipped ? 'Yes' : 'No'}</td>
                                <td>{formatLikertResponses(submission.likertResponses)}</td>
                                <td className="admin-mono-cell">{submission.quizAttemptId || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ) : null}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
