import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { generateCertificateDocument } from '../lib/api/certificate'
import { selectCourseCompletionStatus } from '../lib/courseCompletion'
import { useAppSelector } from '../store/hooks'
import '../styles/shared.css'
import './completionScreen.css'

const MODULES = [
  {
    num: '01',
    title: 'Biological Neuron',
    summary: 'Dendrites collect signals, the soma sums them, and the axon fires when the total crosses a threshold.',
    color: '#2563eb',
    key: 'module1',
  },
  {
    num: '02',
    title: 'Pattern Recognition',
    summary: 'Weights give neurons selectivity. Different weight patterns detect different features — edges, textures, shapes.',
    color: '#7c3aed',
    key: 'module2',
  },
  {
    num: '03',
    title: 'Learning to Learn',
    summary: 'Feedback drives adaptation. Mismatches between prediction and reality push weights toward better guesses.',
    color: '#059669',
    key: 'module3',
  },
]

const NEXT_STEPS = [
  {
    icon: '🧠',
    title: '3Blue1Brown Neural Networks',
    desc: 'Visual deep dive into how neural networks actually learn.',
    url: 'https://www.3blue1brown.com/topics/neural-networks',
  },
  {
    icon: '📘',
    title: 'Neural Networks and Deep Learning',
    desc: 'Free online book by Michael Nielsen — an accessible intro.',
    url: 'http://neuralnetworksanddeeplearning.com/',
  },
  {
    icon: '🎮',
    title: 'TensorFlow Playground',
    desc: 'Tinker with a real neural network right in your browser.',
    url: 'https://playground.tensorflow.org/',
  },
  {
    icon: '🔬',
    title: 'Distill.pub',
    desc: 'Beautiful interactive articles on machine learning concepts.',
    url: 'https://distill.pub/',
  },
]

const CERTIFICATE_NAME_STORAGE_KEY = 'brainAi101.certificateName'

function sanitizeName(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function CompletionScreen({ onGoToModule, onBackToHome }) {
  const completionStatus = useAppSelector(selectCourseCompletionStatus)
  const heroRef = useRef(null)
  const cardsRef = useRef(null)
  const nextRef = useRef(null)
  const [studentName, setStudentName] = useState('')
  const [nameError, setNameError] = useState('')
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false)

  useEffect(() => {
    try {
      const savedName = window.sessionStorage.getItem(CERTIFICATE_NAME_STORAGE_KEY) || ''
      if (savedName) {
        setStudentName(savedName)
      }
    } catch {
      // sessionStorage unavailable — keep runtime-only state
    }
  }, [])

  useEffect(() => {
    try {
      if (studentName) {
        window.sessionStorage.setItem(CERTIFICATE_NAME_STORAGE_KEY, studentName)
      } else {
        window.sessionStorage.removeItem(CERTIFICATE_NAME_STORAGE_KEY)
      }
    } catch {
      // sessionStorage unavailable — keep runtime-only state
    }
  }, [studentName])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cardNodes = cardsRef.current ? Array.from(cardsRef.current.children) : []
      const animatedNodes = [heroRef.current, ...cardNodes, nextRef.current].filter(Boolean)

      gsap.set(animatedNodes, { opacity: 1, y: 0, clearProps: 'transform' })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          gsap.set(animatedNodes, { clearProps: 'opacity,transform' })
        },
      })

      tl.from(heroRef.current, { y: 18, duration: 0.45 })
      tl.from(cardNodes, { y: 14, duration: 0.32, stagger: 0.1 }, '-=0.14')
      tl.from(nextRef.current, { y: 14, duration: 0.36 }, '-=0.08')
    })

    return () => ctx.revert()
  }, [])

  const handleCertificateNameChange = (event) => {
    setStudentName(event.target.value)
    if (nameError) {
      setNameError('')
    }
  }

  const handleGenerateCertificate = async () => {
    if (!completionStatus.isUnlocked) {
      setNameError('Complete the required course flow to unlock the certificate.')
      return
    }

    const normalizedName = sanitizeName(studentName)

    if (!normalizedName) {
      setNameError('Enter your name to generate the certificate.')
      return
    }

    setNameError('')
    setIsGeneratingCertificate(true)

    try {
      const { blob, filename } = await generateCertificateDocument(normalizedName)
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(objectUrl)
      setStudentName(normalizedName)
    } catch (error) {
      console.error('Certificate generation failed', error)
      setNameError(
        error instanceof Error
          ? error.message
          : 'Unable to generate the certificate right now. Please try again.',
      )
    } finally {
      setIsGeneratingCertificate(false)
    }
  }

  return (
    <div className="completion-page">
      <div className="completion-content">
        <div ref={heroRef} className="completion-hero">
          <div className="completion-badge">Course Complete</div>
          <h1 className="completion-headline">You Did It!</h1>
          <p className="completion-subtitle">
            You've journeyed from a single biological neuron all the way to how networks learn.
            That's the foundation of both neuroscience and AI.
          </p>
        </div>

        <section className="completion-recap">
          <h2 className="completion-section-title">What You Learned</h2>
          <div ref={cardsRef} className="completion-module-cards">
            {MODULES.map((mod) => (
              <button
                key={mod.key}
                className="completion-module-card"
                style={{ '--card-accent': mod.color }}
                onClick={() => onGoToModule?.(mod.key)}
              >
                <span className="completion-module-num">{mod.num}</span>
                <h3 className="completion-module-title">{mod.title}</h3>
                <p className="completion-module-summary">{mod.summary}</p>
                <span className="completion-module-revisit">Revisit</span>
              </button>
            ))}
          </div>
        </section>

        <section ref={nextRef} className="completion-next">
          <h2 className="completion-section-title">What's Next?</h2>
          <p className="completion-next-intro">
            Keep exploring — here are some great resources to go deeper.
          </p>
          <div className="completion-next-grid">
            {NEXT_STEPS.map((step, i) => (
              <a
                key={i}
                className="completion-next-card"
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="completion-next-icon">{step.icon}</span>
                <h3 className="completion-next-title">{step.title}</h3>
                <p className="completion-next-desc">{step.desc}</p>
                <span className="completion-next-link">
                  Visit
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="completion-certificate">
          <h2 className="completion-section-title">Certificate of Completion</h2>
          <p className="completion-certificate-intro">
            {completionStatus.isUnlocked
              ? 'Enter your name to generate a completion certificate for this course.'
              : 'The certificate unlocks after you finish every required course step.'}
          </p>

          <div className="completion-certificate-shell">
            <div className="completion-certificate-status">
              <div className="completion-certificate-status-header">
                <div>
                  <p className="completion-certificate-status-label">Completion Progress</p>
                  <h3 className="completion-certificate-status-title">
                    Completed {completionStatus.completedCount} of {completionStatus.totalCount} required course items
                  </h3>
                </div>
                <span
                  className={`completion-certificate-status-badge ${
                    completionStatus.isUnlocked
                      ? 'completion-certificate-status-badge--unlocked'
                      : 'completion-certificate-status-badge--locked'
                  }`}
                >
                  {completionStatus.isUnlocked ? 'Certificate unlocked' : 'Certificate locked'}
                </span>
              </div>

              {completionStatus.missingItems.length > 0 ? (
                <div className="completion-certificate-status-list">
                  <p className="completion-certificate-status-note">
                    Finish the remaining required items to unlock certificate generation.
                  </p>
                  <ul className="completion-certificate-checklist">
                    {completionStatus.items.map((item) => (
                      <li
                        key={item.id}
                        className={`completion-certificate-checklist-item ${
                          item.completed
                            ? 'completion-certificate-checklist-item--done'
                            : 'completion-certificate-checklist-item--pending'
                        }`}
                      >
                        <span className="completion-certificate-checklist-mark" aria-hidden="true">
                          {item.completed ? '✓' : '•'}
                        </span>
                        <span>
                          <strong>{item.label}</strong>
                          {!item.completed ? ` — ${item.detail}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="completion-certificate-status-note">
                  All required course steps are complete. Your certificate is ready.
                </p>
              )}
            </div>

            {completionStatus.isUnlocked ? (
              <>
                <div className="completion-certificate-controls">
                  <label className="completion-certificate-field">
                    <span>Name on certificate</span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={handleCertificateNameChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </label>
                  <p className="completion-certificate-note">
                    Your name is stored only for this browser session.
                  </p>
                  <p className="completion-certificate-note">
                    The certificate is generated on the backend from the official award template and downloads as a PDF. Use the Vercel deployment, or run <code>npm run dev:full</code> locally.
                  </p>
                  {nameError ? (
                    <p className="completion-certificate-error" role="alert">{nameError}</p>
                  ) : null}
                  <div className="completion-certificate-actions">
                    <button
                      type="button"
                      className="shared-btn shared-btn-primary"
                      onClick={handleGenerateCertificate}
                      disabled={isGeneratingCertificate}
                    >
                      {isGeneratingCertificate ? 'Generating PDF…' : 'Generate Certificate PDF'}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <div className="completion-footer">
          <button className="completion-home-btn" onClick={onBackToHome}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l6-6 6 6M4 6.5V13h3v-3h2v3h3V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletionScreen
