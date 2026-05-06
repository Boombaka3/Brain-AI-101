import { useCallback, useEffect, useRef, useState } from 'react'
import scoreClassroomSignal from '../logic/scoreClassroomSignal'
import { clampSomaInput, decaySomaInput, DECAY_INTERVAL_MS } from '../logic/neuronDecay'

export const THRESHOLD = 70
export const MAX_INPUT = 100
export const EXAMPLE_SIGNALS = [
  { label: '"Alex"', value: 'Alex' },
  { label: '"Everyone listen"', value: 'Everyone listen' },
  { label: '"Page turning"', value: 'Page turning' },
]

const SIGNAL_ID_PREFIX = 'sound-neuron-signal'
const FIRE_ANIMATION_MS = 920
const LANE_OFFSETS = [-26, 0, 26]

function cleanPhraseForDisplay(phrase = '') {
  return phrase.trim().replace(/\s+/g, ' ')
}

function buildSignalBubble(phrase, impact, id, index) {
  const cleanPhrase = cleanPhraseForDisplay(phrase)
  const lowerPhrase = cleanPhrase.toLowerCase()
  const isAlexCue = lowerPhrase.includes('alex') && (impact === 80 || impact === 100)
  const strength = impact >= 80 ? 'strong' : impact >= 35 ? 'medium' : 'light'

  return {
    id,
    phrase: cleanPhrase,
    impact,
    isAlexCue,
    strength,
    duration: impact >= 80 ? 640 : impact <= 15 ? 1080 : 860,
    scale: Math.max(0.84, Math.min(1.2, 0.82 + impact / 260)),
    laneOffset: LANE_OFFSETS[index % LANE_OFFSETS.length],
  }
}

function clearIntervalIfNeeded(intervalRef) {
  if (intervalRef.current) {
    window.clearInterval(intervalRef.current)
    intervalRef.current = null
  }
}

function clearTimeouts(timeoutSetRef) {
  timeoutSetRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
  timeoutSetRef.current.clear()
}

function useSoundNeuronExperiment() {
  const [currentPhrase, setCurrentPhrase] = useState('')
  const [somaInput, setSomaInput] = useState(0)
  const [recentSignals, setRecentSignals] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFiring, setIsFiring] = useState(false)
  const [lastResult, setLastResult] = useState('initial')

  const decayIntervalRef = useRef(null)
  const timeoutIdsRef = useRef(new Set())
  const signalCounterRef = useRef(0)
  const somaInputRef = useRef(0)
  const hasSubmittedRef = useRef(false)
  const thresholdHitRef = useRef(false)

  useEffect(() => {
    somaInputRef.current = somaInput
  }, [somaInput])

  useEffect(() => {
    setIsAnimating(recentSignals.length > 0)
  }, [recentSignals.length])

  useEffect(() => {
    const shouldDecay = somaInput > 0 && recentSignals.length === 0 && !isFiring

    if (!shouldDecay) {
      clearIntervalIfNeeded(decayIntervalRef)
      return undefined
    }

    if (decayIntervalRef.current) {
      return undefined
    }

    decayIntervalRef.current = window.setInterval(() => {
      const currentLevel = somaInputRef.current
      const nextLevel = decaySomaInput(currentLevel)

      if (nextLevel === currentLevel) {
        return
      }

      somaInputRef.current = nextLevel
      setSomaInput(nextLevel)

      if (nextLevel === 0 && hasSubmittedRef.current && !thresholdHitRef.current) {
        setLastResult('no-fire')
      }
    }, DECAY_INTERVAL_MS)

    return () => clearIntervalIfNeeded(decayIntervalRef)
  }, [isFiring, recentSignals.length, somaInput])

  useEffect(() => {
    return () => {
      clearIntervalIfNeeded(decayIntervalRef)
      clearTimeouts(timeoutIdsRef)
    }
  }, [])

  const submitSignal = useCallback((phrase) => {
    const cleanPhrase = cleanPhraseForDisplay(phrase)
    const impact = scoreClassroomSignal(cleanPhrase)

    if (impact === 0) {
      setCurrentPhrase('')
      return
    }

    hasSubmittedRef.current = true
    thresholdHitRef.current = false
    setLastResult('initial')
    setCurrentPhrase('')

    signalCounterRef.current += 1
    const signal = buildSignalBubble(cleanPhrase, impact, `${SIGNAL_ID_PREFIX}-${signalCounterRef.current}`, signalCounterRef.current)

    setRecentSignals((current) => [...current, signal])

    const arrivalTimeout = window.setTimeout(() => {
      timeoutIdsRef.current.delete(arrivalTimeout)

      const nextTotal = clampSomaInput(somaInputRef.current + impact, MAX_INPUT)
      somaInputRef.current = nextTotal
      setSomaInput(nextTotal)

      if (nextTotal >= THRESHOLD) {
        thresholdHitRef.current = true
        setIsFiring(true)
        setLastResult(signal.isAlexCue ? 'alex-fire' : 'fire')

        const fireTimeout = window.setTimeout(() => {
          timeoutIdsRef.current.delete(fireTimeout)
          setIsFiring(false)
        }, FIRE_ANIMATION_MS)

        timeoutIdsRef.current.add(fireTimeout)
      }
    }, signal.duration)

    const cleanupTimeout = window.setTimeout(() => {
      timeoutIdsRef.current.delete(cleanupTimeout)
      setRecentSignals((current) => current.filter((entry) => entry.id !== signal.id))
    }, signal.duration + 110)

    timeoutIdsRef.current.add(arrivalTimeout)
    timeoutIdsRef.current.add(cleanupTimeout)
  }, [])

  const submitCurrentPhrase = useCallback((event) => {
    event.preventDefault()
    submitSignal(currentPhrase)
  }, [currentPhrase, submitSignal])

  const submitExamplePhrase = useCallback((phrase) => {
    submitSignal(phrase)
  }, [submitSignal])

  return {
    currentPhrase,
    somaInput,
    recentSignals,
    isAnimating,
    isFiring,
    lastResult,
    setCurrentPhrase,
    submitCurrentPhrase,
    submitExamplePhrase,
  }
}

export default useSoundNeuronExperiment
