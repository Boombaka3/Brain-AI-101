import { useEffect, useRef, useState } from 'react'
import CleanNeuronSvg from './CleanNeuronSvg'
import { staticPayAttentionSvg } from './module1SceneAssets'

const THRESHOLD_LEVEL = 0.72
const LEAK_PER_SECOND = 0.065
const FLOW_TRAVEL_MS = 1350
const MAX_SELECTED_WORDS = 5

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

const WORD_BANK = ['Maya!', 'chair scrape', 'paper rustle', 'quiet chatter', 'HEY!', 'teacher', 'listen']
const DEFAULT_SELECTED_WORDS = ['Maya!', 'chair scrape', 'Maya!', 'paper rustle', 'HEY!']

function formatWordForDisplay(word) {
  return word.trim() || '...'
}

function computeWordWeight(word) {
  const letters = word.replace(/[^a-zA-Z]/g, '')
  const lengthBoost = Math.min(letters.length, 14) * 0.014
  const uppercaseBoost = Math.min((word.match(/[A-Z]/g) || []).length, 6) * 0.03
  const emphasisBoost = /!/.test(word) ? 0.03 : 0
  return 0.08 + lengthBoost + uppercaseBoost + emphasisBoost
}

function buildSignalPackets(words, strengthId, timingId) {
  const strength = STRENGTH_OPTIONS.find((option) => option.id === strengthId) ?? STRENGTH_OPTIONS[1]
  const timing = TIMING_OPTIONS.find((option) => option.id === timingId) ?? TIMING_OPTIONS[1]

  return words.map((word, index) => {
    const amount = computeWordWeight(word) * strength.multiplier

    return {
      id: `${word}-${index}`,
      label: formatWordForDisplay(word),
      type: amount >= 0.27 ? 'primary' : 'secondary',
      amount,
      lane: index % 3,
      delay: index * timing.spacing,
      duration: FLOW_TRAVEL_MS,
    }
  })
}

function getOutcomeCopy(outcome) {
  switch (outcome) {
    case 'running':
      return 'These sounds are arriving fast and starting to fill the bucket.'
    case 'fired':
      return 'These words arrived strongly and close together, so the neuron responded.'
    case 'leaked':
      return 'These words were too soft or too spread out, so the bucket did not fill enough.'
    default:
      return 'These words arrived strongly and close together, so the neuron responded.'
  }
}

function HotSurfaceInteractionPanel() {
  const [strength, setStrength] = useState('medium')
  const [timing, setTiming] = useState('medium')
  const [selectedWords, setSelectedWords] = useState(DEFAULT_SELECTED_WORDS)
  const [customWord, setCustomWord] = useState('')
  const [fillLevel, setFillLevel] = useState(0)
  const [signals, setSignals] = useState([])
  const [runToken, setRunToken] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFiring, setIsFiring] = useState(false)
  const [hasFired, setHasFired] = useState(false)
  const [outcome, setOutcome] = useState('idle')

  const timersRef = useRef([])
  const firedRef = useRef(false)
  const cycleRef = useRef(0)

  const addWord = (word) => {
    const nextWord = formatWordForDisplay(word)

    setSelectedWords((current) => {
      if (current.length >= MAX_SELECTED_WORDS) {
        return [...current.slice(1), nextWord]
      }

      return [...current, nextWord]
    })
  }

  const removeWord = (indexToRemove) => {
    setSelectedWords((current) => current.filter((_, index) => index !== indexToRemove))
  }

  const handleCustomWordSubmit = () => {
    if (!customWord.trim()) {
      return
    }

    addWord(customWord)
    setCustomWord('')
  }

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

        return Math.max(0, current - LEAK_PER_SECOND * 0.08)
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

    const wordsForRun = selectedWords.length > 0 ? selectedWords : DEFAULT_SELECTED_WORDS
    const nextSignals = buildSignalPackets(wordsForRun, strength, timing)
    const lastArrival = nextSignals[nextSignals.length - 1].delay + nextSignals[nextSignals.length - 1].duration

    setSignals([])
    setFillLevel(0)
    setOutcome('running')
    setHasFired(false)
    setIsFiring(false)
    setIsRunning(true)
    firedRef.current = false
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
  const outcomeCopy = getOutcomeCopy(outcome)
  return (
    <div className="module1-panel module1-interaction-panel module1-section-c-preview">
      <div className="module1-section-c-preview__header">
        <div>
          <p className="module1-eyebrow module1-eyebrow-tight">Interactive lab</p>
          <h3 className="module1-panel-title">Which sounds grab attention fastest?</h3>
        </div>
        <p className="module1-card-muted module1-text-reset">
          Pick words on the left and watch what happens. Some sounds give the neuron a bigger push. If enough push
          arrives quickly, the neuron reacts.
        </p>
      </div>

      <div className="module1-section-c__grid">
        <div className="module1-section-c__panel module1-section-c__panel--source">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">SOUND CHOICES</p>
            <h4 className="module1-panel-title">Choose words to send in</h4>
          </div>

          <div className="module1-section-c__source-card">
            <div className="module1-section-c__source-builder">
              <div className="module1-section-c__field-group">
                <span className="module1-section-c__field-label">Word choices</span>
              <div className="module1-section-c__word-bank">
                {WORD_BANK.map((word) => (
                  <button
                    key={word}
                    type="button"
                    className="module1-section-c__word-option"
                    onClick={() => addWord(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
              </div>

              <div className="module1-section-c__field-group">
                <span className="module1-section-c__field-label">Custom word</span>
              <div className="module1-section-c__custom-word">
                <input
                  type="text"
                  value={customWord}
                  onChange={(event) => setCustomWord(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleCustomWordSubmit()
                    }
                  }}
                  placeholder="Type your own word"
                />
                <button type="button" onClick={handleCustomWordSubmit}>
                  Add
                </button>
              </div>
              </div>
            </div>

            <div className="module1-section-c__selected-words">
              <span className="module1-section-c__selected-words-label">Chosen words</span>
              <div className="module1-section-c__selected-words-row">
                {selectedWords.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    className="module1-section-c__selected-word"
                    onClick={() => removeWord(index)}
                    title="Remove this word"
                  >
                    <span>{word}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="module1-section-c__controls">
              <span className="module1-section-c__field-label">Controls</span>
              <div className="module1-section-c__controls-row">
                <div className="module1-section-c__control-group">
                  <span className="module1-section-c__control-label">PUSH SIZE</span>
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
                  <span className="module1-section-c__control-label">SPEED</span>
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

                <button
                  type="button"
                  className="module1-primary-button module1-section-c__run-button"
                  onClick={handleRun}
                >
                  Replay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="module1-section-c__panel module1-section-c__panel--flow">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">WHAT HAPPENS NEXT</p>
            <h4 className="module1-panel-title">Your chosen words move through the listening scene.</h4>
          </div>

          <div className="module1-section-c__flow-stage module1-section-c__flow-stage--scene" aria-hidden="true">
            <div
              className="module1-section-c__flow-scene-art"
              dangerouslySetInnerHTML={{ __html: staticPayAttentionSvg }}
            />
            <div className="module1-section-c__flow-current" />
            <div className="module1-section-c__flow-direction-copy">WATCH THE WORDS MOVE</div>

            {signals.map((signal) => (
              <div
                key={`${runToken}-${signal.id}`}
                className={`module1-section-c__signal module1-section-c__signal--${signal.type}`}
                style={{
                  '--section-c-signal-top': `${24 + signal.lane * 16}%`,
                  animationDelay: `${signal.delay}ms`,
                  animationDuration: `${signal.duration}ms`,
                }}
              >
                {signal.label}
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--one" />
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--two" />
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--three" />
              </div>
            ))}
          </div>
        </div>

        <div className="module1-section-c__panel module1-section-c__panel--neuron">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">NEURON</p>
            <h4 className="module1-panel-title module1-panel-title-xl">The soma is the bucket</h4>
            <p className="module1-card-muted module1-text-reset">
              When enough signals arrive close together, the bucket fills and the neuron reacts.
            </p>
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
            <CleanNeuronSvg
              className="module1-section-c__neuron-art"
              level={3}
              fillPercent={fillLevel * 100}
              isFiring={isFiring}
              showLabels={false}
            />
          </div>

          <p className="module1-section-c__outcome-copy">{outcomeCopy}</p>
        </div>
      </div>
    </div>
  )
}

export default HotSurfaceInteractionPanel
