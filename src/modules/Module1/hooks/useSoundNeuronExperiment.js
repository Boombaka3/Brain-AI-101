import { useEffect, useRef, useState } from 'react'

export const THRESHOLD_LEVEL = 0.72
const LEAK_PER_SECOND = 0.065
const FLOW_TRAVEL_MS = 1350
const MAX_SELECTED_WORDS = 5

export const STRENGTH_OPTIONS = [
  { id: 'low', label: 'Weak', multiplier: 0.7 },
  { id: 'medium', label: 'Medium', multiplier: 0.9 },
  { id: 'high', label: 'Strong', multiplier: 1.08 },
]

export const TIMING_OPTIONS = [
  { id: 'slow', label: 'Spread out', spacing: 1200 },
  { id: 'medium', label: 'Medium', spacing: 760 },
  { id: 'fast', label: 'Close together', spacing: 430 },
]

export const WORD_BANK = ['Maya!', 'chair scrape', 'paper rustle', 'quiet chatter', 'HEY!', 'teacher', 'listen']
export const DEFAULT_SELECTED_WORDS = ['Maya!', 'chair scrape', 'Maya!', 'paper rustle', 'HEY!']

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

export function getWordSignalStrength(word, strengthId = 'medium') {
  const strength = STRENGTH_OPTIONS.find((option) => option.id === strengthId) ?? STRENGTH_OPTIONS[1]
  const amount = computeWordWeight(word) * strength.multiplier

  if (amount >= 0.32) {
    return { amount, label: 'Strong', bars: 3 }
  }

  if (amount >= 0.22) {
    return { amount, label: 'Medium', bars: 2 }
  }

  return { amount, label: 'Weak', bars: 1 }
}

function buildSignalPackets(words, strengthId, timingId) {
  const timing = TIMING_OPTIONS.find((option) => option.id === timingId) ?? TIMING_OPTIONS[1]

  return words.map((word, index) => {
    const { amount } = getWordSignalStrength(word, strengthId)

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

export function getOutcomeCopy(outcome) {
  switch (outcome) {
    case 'running':
      return 'Signals are moving toward the neuron and building input in the soma.'
    case 'fired':
      return 'The neuron fired because the signals were strong enough and arrived close together.'
    case 'leaked':
      return 'The neuron did not fire because the signals were too weak or too spread out.'
    default:
      return 'Send sound signals and watch whether they build enough input to reach threshold.'
  }
}

function useSoundNeuronExperiment() {
  const [strength, setStrength] = useState('medium')
  const [timing, setTiming] = useState('medium')
  const [selectedWords, setSelectedWords] = useState(DEFAULT_SELECTED_WORDS)
  const [customWord, setCustomWord] = useState('')
  const [fillLevel, setFillLevel] = useState(0)
  const [peakFillLevel, setPeakFillLevel] = useState(0)
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
    setPeakFillLevel((current) => Math.max(current, fillLevel))
  }, [fillLevel])

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
    if (selectedWords.length === 0) {
      return
    }

    cycleRef.current += 1
    const cycleId = cycleRef.current

    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []

    const nextSignals = buildSignalPackets(selectedWords, strength, timing)
    const lastArrival = nextSignals[nextSignals.length - 1].delay + nextSignals[nextSignals.length - 1].duration

    setSignals([])
    setFillLevel(0)
    setPeakFillLevel(0)
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

  const handleReset = () => {
    cycleRef.current += 1
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    firedRef.current = false

    setSignals([])
    setFillLevel(0)
    setPeakFillLevel(0)
    setOutcome('idle')
    setHasFired(false)
    setIsFiring(false)
    setIsRunning(false)
  }

  const isPrimed = fillLevel >= THRESHOLD_LEVEL - 0.12 && !hasFired

  return {
    strength,
    setStrength,
    timing,
    setTiming,
    selectedWords,
    customWord,
    setCustomWord,
    fillLevel,
    peakFillLevel,
    signals,
    runToken,
    isRunning,
    isFiring,
    hasFired,
    outcome,
    isPrimed,
    addWord,
    removeWord,
    handleCustomWordSubmit,
    handleRun,
    handleReset,
  }
}

export default useSoundNeuronExperiment
