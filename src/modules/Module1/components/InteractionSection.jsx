import { useEffect, useMemo, useRef, useState } from 'react'
import neuronAsset from '../../../assets/neuron-svgrepo-com.svg'

const THRESHOLD_LEVEL = 0.72
const LEAK_PER_SECOND = 0.065
const FLOW_TRAVEL_MS = 1350

const STRENGTH_OPTIONS = [
  { id: 'low', label: 'Low', multiplier: 0.7 },
  { id: 'medium', label: 'Medium', multiplier: 0.9 },
  { id: 'high', label: 'High', multiplier: 1.08 },
]

const TIMING_OPTIONS = [
  { id: 'slow', label: 'Slow', spacing: 1200 },
  { id: 'medium', label: 'Medium', spacing: 760 },
  { id: 'fast', label: 'Fast', spacing: 430 },
]

const BASE_SIGNALS = [
  { id: 'cue-1', label: 'Maya!', type: 'primary', amount: 0.32, lane: 0 },
  { id: 'noise-1', label: 'chair scrape', type: 'secondary', amount: 0.1, lane: 1 },
  { id: 'cue-2', label: 'Maya!', type: 'primary', amount: 0.22, lane: 0 },
  { id: 'noise-2', label: 'paper rustle', type: 'secondary', amount: 0.1, lane: 2 },
  { id: 'cue-3', label: 'hey!', type: 'primary', amount: 0.18, lane: 1 },
]

function buildSignalPackets(strengthId, timingId) {
  const strength = STRENGTH_OPTIONS.find((option) => option.id === strengthId) ?? STRENGTH_OPTIONS[1]
  const timing = TIMING_OPTIONS.find((option) => option.id === timingId) ?? TIMING_OPTIONS[1]

  return BASE_SIGNALS.map((signal, index) => ({
    ...signal,
    amount: signal.amount * strength.multiplier,
    delay: index * timing.spacing,
    duration: FLOW_TRAVEL_MS,
  }))
}

function getOutcomeCopy(outcome) {
  switch (outcome) {
    case 'running':
      return 'Signals are arriving from the sound source. Watch the soma fill while the leak quietly pulls it back down.'
    case 'fired':
      return 'The fill crossed the threshold, the soma released, and the neuron sent an output pulse away.'
    case 'leaked':
      return 'The sounds arrived too slowly. The fill leaked away before it could trip the threshold.'
    default:
      return 'Run the scene to compare a quick burst of meaningful sound with slower, weaker background noise.'
  }
}

function InteractionSection() {
  const [strength, setStrength] = useState('medium')
  const [timing, setTiming] = useState('medium')
  const [fillLevel, setFillLevel] = useState(0)
  const [signals, setSignals] = useState([])
  const [runToken, setRunToken] = useState(0)
  const [pulseToken, setPulseToken] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFiring, setIsFiring] = useState(false)
  const [hasFired, setHasFired] = useState(false)
  const [outcome, setOutcome] = useState('idle')

  const timersRef = useRef([])
  const fillRef = useRef(fillLevel)
  const firedRef = useRef(false)
  const cycleRef = useRef(0)

  useEffect(() => {
    fillRef.current = fillLevel
  }, [fillLevel])

  useEffect(() => {
    firedRef.current = hasFired
  }, [hasFired])

  useEffect(() => {
    const shouldLeak = isRunning || fillLevel > 0.001

    if (!shouldLeak) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setFillLevel((current) => {
        if (current <= 0) {
          return 0
        }

        const next = Math.max(0, current - LEAK_PER_SECOND * 0.08)
        return next
      })
    }, 80)

    return () => window.clearInterval(interval)
  }, [fillLevel, isRunning])

  useEffect(() => {
    if (firedRef.current || fillLevel < THRESHOLD_LEVEL) {
      return undefined
    }

    firedRef.current = true
    setHasFired(true)
    setIsFiring(true)
    setOutcome('fired')
    setPulseToken((current) => current + 1)

    const calmTimer = window.setTimeout(() => {
      setIsFiring(false)
    }, 900)

    const dropTimer = window.setTimeout(() => {
      setFillLevel((current) => Math.min(current, 0.14))
    }, 620)

    const clearTimer = window.setTimeout(() => {
      setFillLevel(0)
      setIsRunning(false)
    }, 1650)

    timersRef.current.push(calmTimer, dropTimer, clearTimer)

    return () => {
      window.clearTimeout(calmTimer)
      window.clearTimeout(dropTimer)
      window.clearTimeout(clearTimer)
    }
  }, [fillLevel])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [])

  const handleRun = () => {
    cycleRef.current += 1
    const cycleId = cycleRef.current

    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []

    const nextSignals = buildSignalPackets(strength, timing)
    const lastArrival = nextSignals[nextSignals.length - 1].delay + nextSignals[nextSignals.length - 1].duration

    setSignals([])
    setFillLevel(0)
    setOutcome('running')
    setHasFired(false)
    setIsFiring(false)
    setIsRunning(true)
    firedRef.current = false
    fillRef.current = 0
    setRunToken((current) => current + 1)

    window.requestAnimationFrame(() => {
      if (cycleRef.current !== cycleId) {
        return
      }

      setSignals(nextSignals)
    })

    nextSignals.forEach((signal) => {
      const timer = window.setTimeout(() => {
        if (firedRef.current || cycleRef.current !== cycleId) {
          return
        }

        setFillLevel((current) => Math.min(1, current + signal.amount))
      }, signal.delay + signal.duration)

      timersRef.current.push(timer)
    })

    const settleTimer = window.setTimeout(() => {
      if (!firedRef.current && cycleRef.current === cycleId) {
        setOutcome('leaked')
        setIsRunning(false)
      }
    }, lastArrival + 1700)

    timersRef.current.push(settleTimer)
  }

  const approachingThreshold = fillLevel >= THRESHOLD_LEVEL - 0.12 && !hasFired
  const leakVisible = fillLevel > 0.04
  const outcomeCopy = getOutcomeCopy(outcome)

  const predictedPackets = useMemo(() => buildSignalPackets(strength, timing), [strength, timing])

  return (
    <section className="module1-section module1-interaction-section module1-section-c">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">C. Scenario Interaction</p>
        <h2>Can a meaningful sound fill the neuron fast enough to make it fire?</h2>
        <p>
          Signals start in the sound scene on the right, travel toward the neuron, and build inside the soma like water
          in a leaky bucket.
        </p>
      </div>

      <div className="module1-section-c__grid">
        <div className="module1-section-c__panel module1-section-c__panel--neuron">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Neuron</p>
            <h3 className="module1-panel-title module1-panel-title-xl">The soma is the bucket</h3>
          </div>

          <div
            className={[
              'module1-section-c__neuron-stage',
              approachingThreshold ? 'is-primed' : '',
              isFiring ? 'is-firing' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="module1-section-c__output-rail" aria-hidden="true">
              <span className="module1-section-c__output-label">output pulse</span>
              <span className="module1-section-c__output-arrow" />
              {hasFired && (
                <span key={pulseToken} className="module1-section-c__output-pulse">
                  fire
                </span>
              )}
            </div>

            <img className="module1-section-c__neuron-art" src={neuronAsset} alt="Biological neuron diagram" />

            <div
              className="module1-section-c__soma-overlay"
              style={{
                '--section-c-fill-level': `${fillLevel * 100}%`,
                '--section-c-threshold-level': `${THRESHOLD_LEVEL * 100}%`,
              }}
            >
              <div className="module1-section-c__soma-ring" />
              <div className="module1-section-c__soma-fill" />
              <div className="module1-section-c__soma-surface" />
              <div className="module1-section-c__soma-threshold">
                <span />
                <strong>threshold</strong>
              </div>
              <div className="module1-section-c__soma-leak-port" />
              <div className={`module1-section-c__soma-leak-stream ${leakVisible ? 'is-visible' : ''}`} />
              <div className={`module1-section-c__soma-leak-drop module1-section-c__soma-leak-drop--one ${leakVisible ? 'is-visible' : ''}`} />
              <div className={`module1-section-c__soma-leak-drop module1-section-c__soma-leak-drop--two ${leakVisible ? 'is-visible' : ''}`} />
            </div>

            <div className="module1-section-c__input-inlet" aria-hidden="true">
              <span />
              <small>signals enter</small>
            </div>
          </div>

          <p className="module1-section-c__outcome-copy">{outcomeCopy}</p>
        </div>

        <div className="module1-section-c__panel module1-section-c__panel--flow">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Signal Flow</p>
            <h3 className="module1-panel-title">Right to left into the neuron</h3>
          </div>

          <div className="module1-section-c__flow-stage" aria-hidden="true">
            <div className="module1-section-c__flow-current" />
            <div className="module1-section-c__flow-lane module1-section-c__flow-lane--top" />
            <div className="module1-section-c__flow-lane module1-section-c__flow-lane--mid" />
            <div className="module1-section-c__flow-lane module1-section-c__flow-lane--low" />
            <div className="module1-section-c__flow-direction-copy">sound signals move toward the soma</div>

            {signals.map((signal) => (
              <div
                key={`${runToken}-${signal.id}`}
                className={`module1-section-c__signal module1-section-c__signal--${signal.type}`}
                style={{
                  '--section-c-signal-top': `${22 + signal.lane * 23}%`,
                  animationDelay: `${signal.delay}ms`,
                  animationDuration: `${signal.duration}ms`,
                }}
              >
                {signal.label}
              </div>
            ))}
          </div>
        </div>

        <div className="module1-section-c__panel module1-section-c__panel--source">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Sound Scene</p>
            <h3 className="module1-panel-title">One meaningful cue, softer background sounds</h3>
          </div>

          <div className="module1-section-c__source-card">
            <div className="module1-section-c__source-main">
              <span className="module1-section-c__source-main-label">important sound</span>
              <strong>“Maya!”</strong>
              <p>A meaningful voice is the strongest signal in the scene.</p>
            </div>

            <div className="module1-section-c__source-noise">
              <span>chair scrape</span>
              <span>paper rustle</span>
              <span>quiet chatter</span>
            </div>

            <div className="module1-section-c__source-preview">
              {predictedPackets.map((signal) => (
                <span
                  key={signal.id}
                  className={`module1-section-c__source-preview-chip module1-section-c__source-preview-chip--${signal.type}`}
                >
                  {signal.label}
                </span>
              ))}
            </div>
          </div>

          <div className="module1-section-c__controls">
            <div className="module1-section-c__control-group">
              <span className="module1-section-c__control-label">Input strength</span>
              <div className="module1-section-c__toggle-row">
                {STRENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={strength === option.id ? 'is-selected' : ''}
                    onClick={() => setStrength(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="module1-section-c__control-group">
              <span className="module1-section-c__control-label">Input timing</span>
              <div className="module1-section-c__toggle-row">
                {TIMING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={timing === option.id ? 'is-selected' : ''}
                    onClick={() => setTiming(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="module1-primary-button module1-section-c__run-button" onClick={handleRun}>
              Replay Scene
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InteractionSection
