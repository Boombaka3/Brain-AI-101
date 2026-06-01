import { useMemo, useState } from 'react'
import { useAdminSubmissions } from '../hooks/useAdminSubmissions'
import { getExportUrl } from '../lib/api/submissions'
import { requestText } from '../lib/api/client'
import './adminSubmissions.css'

interface AdminSubmissionsPageProps {
  onBack: () => void
}

function downloadCsv(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function AdminSubmissionsPage({ onBack }: AdminSubmissionsPageProps) {
  const savedToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('brainAi101.adminToken') || '' : ''
  const [token, setToken] = useState(savedToken)
  const [exportError, setExportError] = useState('')
  const [exportingKind, setExportingKind] = useState<'' | 'quiz' | 'evaluations'>('')
  const { data, status, error, load, isLoading } = useAdminSubmissions()

  const hasData = Boolean(data && (data.quizAttempts.length > 0 || data.evaluations.length > 0))

  const summaryCards = useMemo(() => {
    if (!data) {
      return []
    }

    return [
      { label: 'Quiz attempts', value: data.summary.quizAttemptCount },
      { label: 'Evaluations', value: data.summary.evaluationCount },
      { label: 'Average quiz score', value: data.summary.averageQuizScore },
      { label: 'Passed quizzes', value: data.summary.passCount },
      { label: 'Pre-course', value: data.summary.preCourseCount },
      { label: 'Post-course', value: data.summary.postCourseCount },
    ]
  }, [data])

  const handleLoad = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setExportError('')

    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('brainAi101.adminToken', token)
      }
      await load(token)
    } catch {
      // Hook state already captures the useful error message.
    }
  }

  const handleExport = async (kind: 'quiz' | 'evaluations') => {
    setExportingKind(kind)
    setExportError('')

    try {
      const contents = await requestText(getExportUrl(kind), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const filename = kind === 'quiz'
        ? 'brain-ai-101-quiz-attempts.csv'
        : 'brain-ai-101-evaluations.csv'

      downloadCsv(filename, contents)
    } catch (downloadError) {
      setExportError(downloadError instanceof Error ? downloadError.message : 'Unable to export CSV.')
    } finally {
      setExportingKind('')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={onBack}>
            Back to Home
          </button>
        </div>

        <section className="admin-hero">
          <span className="admin-eyebrow">Admin</span>
          <h1>Submission Dashboard</h1>
          <p>
            Review stored quiz attempts and evaluation responses, then export the records as CSV for analysis.
          </p>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Load submissions</h2>
            <p>Enter the read token from your Vercel environment to access the stored data.</p>
          </div>

          <form className="admin-auth-form" onSubmit={handleLoad}>
            <label className="admin-field">
              <span>Admin token</span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter ADMIN_READ_TOKEN"
                autoComplete="current-password"
              />
            </label>

            <div className="admin-actions">
              <button type="submit" className="shared-btn shared-btn-primary" disabled={!token.trim() || isLoading}>
                {isLoading ? 'Loading…' : 'Load submissions'}
              </button>
              <button
                type="button"
                className="shared-btn shared-btn-secondary"
                onClick={() => setToken('')}
                disabled={isLoading}
              >
                Clear token
              </button>
            </div>
          </form>

          {error && <p className="ce-inline-error" role="alert">{error}</p>}
          {exportError && <p className="ce-inline-error" role="alert">{exportError}</p>}
        </section>

        {status === 'success' && data && (
          <>
            <section className="admin-summary-grid">
              {summaryCards.map((card) => (
                <article key={card.label} className="admin-summary-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </article>
              ))}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-head admin-panel-head--split">
                <div>
                  <h2>Exports</h2>
                  <p>Download raw quiz attempts or evaluation responses for reporting.</p>
                </div>
                <div className="admin-actions admin-actions--tight">
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('quiz')}
                    disabled={exportingKind !== ''}
                  >
                    {exportingKind === 'quiz' ? 'Exporting…' : 'Export quiz CSV'}
                  </button>
                  <button
                    type="button"
                    className="shared-btn shared-btn-secondary"
                    onClick={() => handleExport('evaluations')}
                    disabled={exportingKind !== ''}
                  >
                    {exportingKind === 'evaluations' ? 'Exporting…' : 'Export evaluations CSV'}
                  </button>
                </div>
              </div>
            </section>

            {!hasData ? (
              <section className="admin-panel">
                <div className="admin-empty">
                  <h2>No submissions yet</h2>
                  <p>The database is connected, but there are no stored quiz attempts or evaluations yet.</p>
                </div>
              </section>
            ) : (
              <>
                <section className="admin-panel">
                  <div className="admin-panel-head">
                    <h2>Quiz attempts</h2>
                    <p>Each row shows the stored score, pass status, and session id for a completed knowledge check.</p>
                  </div>
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
                        {data.quizAttempts.map((attempt) => (
                          <tr key={attempt.id}>
                            <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
                            <td>{attempt.sessionId}</td>
                            <td>{attempt.score} / {attempt.maxScore}</td>
                            <td>{attempt.passed ? 'Yes' : 'No'}</td>
                            <td>{attempt.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="admin-panel">
                  <div className="admin-panel-head">
                    <h2>Evaluations</h2>
                    <p>Each row shows whether the response was pre-course or post-course, whether it was skipped, and whether it links to a quiz attempt.</p>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Submitted</th>
                          <th>Session</th>
                          <th>Source</th>
                          <th>Skipped</th>
                          <th>Likert answers</th>
                          <th>Quiz link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.evaluations.map((submission) => (
                          <tr key={submission.id}>
                            <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                            <td>{submission.sessionId}</td>
                            <td>{submission.source}</td>
                            <td>{submission.skipped ? 'Yes' : 'No'}</td>
                            <td>{Object.keys(submission.likertResponses).length}</td>
                            <td>{submission.quizAttemptId || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
