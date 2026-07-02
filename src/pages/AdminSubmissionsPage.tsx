import type { FormEvent } from 'react'
import { Fragment, useMemo, useState } from 'react'
import { useAdminSubmissions } from '../hooks/useAdminSubmissions'
import type { AdminExportType } from '../types/admin'
import type { EvaluationSubmissionRecord, QuizAttemptRecord } from '../types/submission'
import '../modules/CourseEvaluation/courseEvaluation.css'
import './adminSubmissions.css'

const LIKERT_ITEMS = [
  { id: 'likert-1', label: 'Neuron parts' },
  { id: 'likert-2', label: 'Signal flow' },
  { id: 'likert-3', label: 'Bio vs artificial neuron' },
  { id: 'likert-4', label: 'Inputs, weights, activation' },
  { id: 'likert-5', label: 'Learning from feedback' },
  { id: 'likert-6', label: 'Interest in AI/neuro' },
]

const SCORE_BUCKETS = Array.from({ length: 11 }, (_, score) => score)

type AdminSessionFilter = 'all' | 'paired' | 'passed' | 'failed'

interface AdminSessionAnalyticsRow {
  sessionId: string
  pre: EvaluationSubmissionRecord | null
  post: EvaluationSubmissionRecord | null
  quiz: QuizAttemptRecord | null
  preAvg: number | null
  postAvg: number | null
  delta: number | null
  paired: boolean
}

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

function getLikertValue(responses: Record<string, number> | undefined, id: string) {
  const value = responses?.[id]
  return Number.isFinite(value) ? value : null
}

function averageLikert(responses: Record<string, number> | undefined) {
  const values = LIKERT_ITEMS
    .map((item) => getLikertValue(responses, item.id))
    .filter((value): value is number => value !== null)

  if (values.length === 0) {
    return null
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function latestBySubmittedAt<T extends { submittedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] ?? null
}

function formatMetric(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—'
  }

  return value.toFixed(digits)
}

function formatDelta(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—'
  }

  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}`
}

function deltaTone(value: number | null | undefined) {
  if (value === null || value === undefined || Math.abs(value) < 0.005) {
    return 'neutral'
  }

  return value > 0 ? 'positive' : 'negative'
}

function truncateSessionId(sessionId: string) {
  return sessionId.length > 8 ? sessionId.slice(0, 8) : sessionId
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
  const [sessionSearchText, setSessionSearchText] = useState('')
  const [sessionFilter, setSessionFilter] = useState<AdminSessionFilter>('all')
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

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

  const analyticsData = useMemo(() => {
    if (!data) {
      return null
    }

    const groupedSessions = new Map<string, {
      pre: EvaluationSubmissionRecord[]
      post: EvaluationSubmissionRecord[]
      quiz: QuizAttemptRecord[]
    }>()

    const ensureSession = (sessionId: string) => {
      const existing = groupedSessions.get(sessionId)
      if (existing) {
        return existing
      }

      const next = { pre: [], post: [], quiz: [] }
      groupedSessions.set(sessionId, next)
      return next
    }

    data.evaluations.forEach((submission) => {
      const session = ensureSession(submission.sessionId)
      if (submission.source === 'pre-course') {
        session.pre.push(submission)
      }

      if (submission.source === 'course-evaluation') {
        session.post.push(submission)
      }
    })

    data.quizAttempts.forEach((attempt) => {
      ensureSession(attempt.sessionId).quiz.push(attempt)
    })

    const sessionRows: AdminSessionAnalyticsRow[] = Array.from(groupedSessions.entries())
      .map(([sessionId, records]) => {
        const pre = latestBySubmittedAt(records.pre)
        const post = latestBySubmittedAt(records.post)
        const quiz = latestBySubmittedAt(records.quiz)
        const preAvg = averageLikert(pre?.likertResponses)
        const postAvg = averageLikert(post?.likertResponses)
        const delta = preAvg !== null && postAvg !== null ? postAvg - preAvg : null

        return {
          sessionId,
          pre,
          post,
          quiz,
          preAvg,
          postAvg,
          delta,
          paired: Boolean(pre && post),
        }
      })
      .sort((a, b) => a.sessionId.localeCompare(b.sessionId))

    const pairedRows = sessionRows.filter((row) => row.paired)

    const likertComparisons = LIKERT_ITEMS.map((item) => {
      const pairs = pairedRows
        .map((row) => ({
          pre: getLikertValue(row.pre?.likertResponses, item.id),
          post: getLikertValue(row.post?.likertResponses, item.id),
        }))
        .filter((pair): pair is { pre: number; post: number } => pair.pre !== null && pair.post !== null)

      const preMean = pairs.length
        ? pairs.reduce((sum, pair) => sum + pair.pre, 0) / pairs.length
        : null
      const postMean = pairs.length
        ? pairs.reduce((sum, pair) => sum + pair.post, 0) / pairs.length
        : null

      return {
        ...item,
        preMean,
        postMean,
        delta: preMean !== null && postMean !== null ? postMean - preMean : null,
        count: pairs.length,
      }
    })

    const scoreDistribution = SCORE_BUCKETS.map((score) => ({
      score,
      count: data.quizAttempts.filter((attempt) => attempt.score === score).length,
    }))
    const maxScoreCount = Math.max(1, ...scoreDistribution.map((bucket) => bucket.count))

    return {
      sessionRows,
      pairedRows,
      pairedCount: pairedRows.length,
      likertComparisons,
      scoreDistribution,
      maxScoreCount,
    }
  }, [data])

  const filteredSessionRows = useMemo(() => {
    if (!analyticsData) {
      return []
    }

    const searchQuery = sessionSearchText.trim().toLowerCase()

    return analyticsData.sessionRows
      .filter((row) => !searchQuery || row.sessionId.toLowerCase().includes(searchQuery))
      .filter((row) => {
        if (sessionFilter === 'paired') {
          return row.paired
        }

        if (sessionFilter === 'passed') {
          return row.quiz?.passed === true
        }

        if (sessionFilter === 'failed') {
          return row.quiz?.passed === false
        }

        return true
      })
  }, [analyticsData, sessionFilter, sessionSearchText])

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

            <section className="ce-panel admin-submissions-panel admin-analytics-panel">
              <div className="ce-panel-head">
                <h2>Likert pre/post comparison</h2>
                <p>Paired analysis uses only sessions that submitted both pre-course and post-course evaluations.</p>
              </div>

              <div className="admin-analytics-meta">
                <span>
                  Paired sessions: <strong>{analyticsData?.pairedCount ?? 0}</strong>
                </span>
                <span className="admin-chart-legend">
                  <span className="admin-legend-dot admin-legend-dot--pre" /> Pre-course mean
                </span>
                <span className="admin-chart-legend">
                  <span className="admin-legend-dot admin-legend-dot--post" /> Post-course mean
                </span>
              </div>

              {analyticsData && analyticsData.pairedCount > 0 ? (
                <div className="admin-likert-chart" aria-label="Likert pre and post comparison chart">
                  {analyticsData.likertComparisons.map((item) => {
                    const preWidth = `${Math.max(0, Math.min(100, ((item.preMean ?? 0) / 5) * 100))}%`
                    const postWidth = `${Math.max(0, Math.min(100, ((item.postMean ?? 0) / 5) * 100))}%`

                    return (
                      <article className="admin-likert-row" key={item.id}>
                        <div className="admin-likert-label">
                          <strong>{item.label}</strong>
                          <span>{item.count} paired responses</span>
                        </div>
                        <div className="admin-likert-bars">
                          <div className="admin-likert-bar-line">
                            <span className="admin-likert-bar-title">Pre</span>
                            <span className="admin-likert-bar-track">
                              <span className="admin-likert-bar-fill admin-likert-bar-fill--pre" style={{ width: preWidth }} />
                            </span>
                            <span className="admin-likert-value">{formatMetric(item.preMean)}</span>
                          </div>
                          <div className="admin-likert-bar-line">
                            <span className="admin-likert-bar-title">Post</span>
                            <span className="admin-likert-bar-track">
                              <span className="admin-likert-bar-fill admin-likert-bar-fill--post" style={{ width: postWidth }} />
                            </span>
                            <span className="admin-likert-value">{formatMetric(item.postMean)}</span>
                          </div>
                        </div>
                        <span className={`admin-delta-pill admin-delta-pill--${deltaTone(item.delta)}`}>
                          {formatDelta(item.delta)}
                        </span>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="admin-empty-note">No paired pre/post evaluation sessions are available yet.</p>
              )}
            </section>

            <section className="ce-panel admin-submissions-panel admin-analytics-panel">
              <div className="ce-panel-head">
                <h2>Individual session comparison</h2>
                <p>Filter sessions, then open a row to compare each Likert item before and after the course.</p>
              </div>

              <div className="admin-session-controls">
                <label className="admin-filter-field admin-filter-field--search">
                  <span>Search session</span>
                  <input
                    type="search"
                    value={sessionSearchText}
                    onChange={(event) => setSessionSearchText(event.target.value)}
                    placeholder="Search by session ID"
                  />
                </label>

                <label className="admin-filter-field">
                  <span>Session filter</span>
                  <select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value as AdminSessionFilter)}>
                    <option value="all">All</option>
                    <option value="paired">Paired only</option>
                    <option value="passed">Quiz passed</option>
                    <option value="failed">Quiz failed</option>
                  </select>
                </label>
              </div>

              {filteredSessionRows.length === 0 ? (
                <p className="admin-empty-note">No sessions match the current analytics filters.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-session-table">
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Quiz score</th>
                        <th>Pre avg</th>
                        <th>Post avg</th>
                        <th>Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessionRows.map((row) => {
                        const isExpanded = expandedSessionId === row.sessionId
                        const passTone = row.quiz ? (row.quiz.passed ? 'passed' : 'failed') : 'missing'

                        return (
                          <Fragment key={row.sessionId}>
                            <tr
                              className={`admin-session-row${isExpanded ? ' admin-session-row--expanded' : ''}`}
                              tabIndex={0}
                              onClick={() => setExpandedSessionId(isExpanded ? null : row.sessionId)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  setExpandedSessionId(isExpanded ? null : row.sessionId)
                                }
                              }}
                            >
                              <td className="admin-mono-cell" title={row.sessionId}>
                                {truncateSessionId(row.sessionId)}
                              </td>
                              <td>
                                <span className="admin-score-cell">
                                  {row.quiz ? `${row.quiz.score}/${row.quiz.maxScore}` : '—'}
                                  <span className={`admin-pass-badge admin-pass-badge--${passTone}`}>
                                    {row.quiz ? (row.quiz.passed ? 'Pass' : 'Fail') : 'No quiz'}
                                  </span>
                                </span>
                              </td>
                              <td>{formatMetric(row.preAvg)}</td>
                              <td>{formatMetric(row.postAvg)}</td>
                              <td>
                                <span className={`admin-delta-pill admin-delta-pill--${deltaTone(row.delta)}`}>
                                  {formatDelta(row.delta)}
                                </span>
                              </td>
                            </tr>
                            {isExpanded ? (
                              <tr className="admin-session-detail-row">
                                <td colSpan={5}>
                                  <div className="admin-session-detail">
                                    {LIKERT_ITEMS.map((item) => {
                                      const preValue = getLikertValue(row.pre?.likertResponses, item.id)
                                      const postValue = getLikertValue(row.post?.likertResponses, item.id)
                                      const preWidth = `${Math.max(0, Math.min(100, ((preValue ?? 0) / 5) * 100))}%`
                                      const postWidth = `${Math.max(0, Math.min(100, ((postValue ?? 0) / 5) * 100))}%`

                                      return (
                                        <div className="admin-session-mini-row" key={item.id}>
                                          <span className="admin-session-mini-label">{item.label}</span>
                                          <div className="admin-session-mini-bars">
                                            <span className="admin-session-mini-track" aria-label={`Pre ${item.label}: ${preValue ?? 'missing'}`}>
                                              <span className="admin-session-mini-fill admin-session-mini-fill--pre" style={{ width: preWidth }} />
                                            </span>
                                            <span className="admin-session-mini-track" aria-label={`Post ${item.label}: ${postValue ?? 'missing'}`}>
                                              <span className="admin-session-mini-fill admin-session-mini-fill--post" style={{ width: postWidth }} />
                                            </span>
                                          </div>
                                          <span className="admin-session-mini-values">
                                            {preValue ?? '—'} / {postValue ?? '—'}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="ce-panel admin-submissions-panel admin-analytics-panel">
              <div className="ce-panel-head">
                <h2>Quiz score distribution</h2>
                <p>Scores are grouped from 0 to 10, with passing scores shown in green.</p>
              </div>

              {analyticsData && data.quizAttempts.length > 0 ? (
                <div className="admin-score-distribution" aria-label="Quiz score distribution chart">
                  {analyticsData.scoreDistribution.map((bucket) => {
                    const barHeight = bucket.count === 0
                      ? '0%'
                      : `${Math.max(8, (bucket.count / analyticsData.maxScoreCount) * 100)}%`
                    const tone = bucket.score >= 7 ? 'pass' : 'fail'

                    return (
                      <div className="admin-score-column" key={bucket.score}>
                        <span className="admin-score-count">{bucket.count}</span>
                        <span className="admin-score-bar-track">
                          <span
                            className={`admin-score-bar-fill admin-score-bar-fill--${tone}`}
                            style={{ height: barHeight }}
                          />
                        </span>
                        <span className="admin-score-label">{bucket.score}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="admin-empty-note">No quiz attempts are available for score distribution yet.</p>
              )}
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
