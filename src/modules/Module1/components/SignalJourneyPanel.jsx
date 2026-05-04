import { useEffect, useMemo, useRef, useState } from 'react'
import CleanNeuronSvg from './CleanNeuronSvg'
import { staticEyesSvg, staticPayAttentionSvg } from './module1SceneAssets'
import {
  buildJourneyPackets,
  getJourneyLeakStep,
  getJourneyOutcomeCopy,
  getJourneySceneVariant,
  getJourneyThresholdLevel,
} from './signalJourneyUtils'

function HotSurfaceScene({ pathLabels }) {
  return (
    <div className="module1-section-c__touch-scene">
      <div className="module1-section-c__touch-glow module1-section-c__touch-glow--one" />
      <div className="module1-section-c__touch-glow module1-section-c__touch-glow--two" />
      <div className="module1-section-c__touch-surface">
        <div className="module1-section-c__touch-surface-rim" />
        <div className="module1-section-c__touch-surface-core" />
        <div className="module1-section-c__touch-heat module1-section-c__touch-heat--one" />
        <div className="module1-section-c__touch-heat module1-section-c__touch-heat--two" />
        <div className="module1-section-c__touch-heat module1-section-c__touch-heat--three" />
      </div>
      <div className="module1-section-c__touch-hand">
        <div className="module1-section-c__touch-arm" />
        <div className="module1-section-c__touch-finger module1-section-c__touch-finger--one" />
        <div className="module1-section-c__touch-finger module1-section-c__touch-finger--two" />
        <div className="module1-section-c__touch-finger module1-section-c__touch-finger--three" />
      </div>
      <div className="module1-section-c__touch-receptors">
        {pathLabels.map((label, index) => (
          <div
            key={label}
            className={`module1-section-c__touch-receptor module1-section-c__touch-receptor--${index + 1}`}
          >
            <span className="module1-section-c__touch-receptor-dot" />
            <small>{label}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderScene(sceneVariant, pathLabels) {
  if (sceneVariant === 'touch') {
    return <HotSurfaceScene pathLabels={pathLabels} />
  }

  return null
}

function getSceneMarkup(sceneVariant) {
  switch (sceneVariant) {
    case 'hearing':
      return staticPayAttentionSvg
    case 'vision':
      return staticEyesSvg
    default:
      return null
  }
}

function getSceneDirectionCopy(sceneVariant) {
  switch (sceneVariant) {
    case 'touch':
      return 'heat and pain signals race inward from the fingertip'
    case 'hearing':
      return 'meaningful sound travels toward the neuron'
    case 'vision':
      return 'light cues race toward the neuron'
    default:
      return 'incoming signals travel toward the neuron'
  }
}

function getStageHeading(scenarioLabel) {
  return `${scenarioLabel} signal journey`
}

function getStageSubcopy(sceneVariant) {
  switch (sceneVariant) {
    case 'touch':
      return 'The Part C animation style now drives the hot-pan experiment too.'
    case 'hearing':
      return 'This keeps the older animated scene feel from the original interaction.'
    case 'vision':
      return 'A fast visual cue can still be shown as a stream of incoming signals.'
    default:
      return 'Each pathway contributes part of the total that builds in the soma.'
  }
}

function SignalJourneyPanel({ scenarioLabel, scenarioId, pathLabels, contributions, threshold, replayToken }) {
  const [signals, setSignals] = useState([])
  const [fillLevel, setFillLevel] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFiring, setIsFiring] = useState(false)
  const [hasFired, setHasFired] = useState(false)
  const [outcome, setOutcome] = useState('idle')

  const timersRef = useRef([])
  const cycleRef = useRef(0)
  const firedRef = useRef(false)

  const sceneVariant = getJourneySceneVariant(scenarioId)
  const sceneMarkup = getSceneMarkup(sceneVariant)
  const sceneNode = renderScene(sceneVariant, pathLabels)
  const thresholdLevel = getJourneyThresholdLevel()
  const packets = useMemo(
    () => buildJourneyPackets(pathLabels, contributions, threshold),
    [contributions, pathLabels, threshold],
  )

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

        return Math.max(0, current - getJourneyLeakStep())
      })
    }, 80)

    return () => window.clearInterval(interval)
  }, [fillLevel, isRunning])

  useEffect(() => {
    if (firedRef.current || fillLevel < thresholdLevel) {
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
      setOutcome('idle')
    }, 1650)

    timersRef.current.push(calmTimer, dropTimer, clearTimer)

    return () => {
      window.clearTimeout(calmTimer)
      window.clearTimeout(dropTimer)
      window.clearTimeout(clearTimer)
    }
  }, [fillLevel, thresholdLevel])

  useEffect(() => {
    if (replayToken === 0) {
      return undefined
    }

    cycleRef.current += 1
    const cycleId = cycleRef.current

    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []

    const lastPacket = packets[packets.length - 1]
    const settleAt = lastPacket ? lastPacket.delay + lastPacket.duration + 1700 : 1700

    setSignals([])
    setFillLevel(0)
    setOutcome('running')
    setHasFired(false)
    setIsFiring(false)
    setIsRunning(true)
    firedRef.current = false

    window.requestAnimationFrame(() => {
      if (cycleRef.current !== cycleId) {
        return
      }

      setSignals(packets)
    })

    packets.forEach((packet) => {
      const timer = window.setTimeout(() => {
        if (firedRef.current || cycleRef.current !== cycleId) {
          return
        }

        setFillLevel((current) => Math.min(1, current + packet.amount))
      }, packet.delay + packet.duration)

      timersRef.current.push(timer)
    })

    const settleTimer = window.setTimeout(() => {
      if (!firedRef.current && cycleRef.current === cycleId) {
        setOutcome('leaked')
        setIsRunning(false)
      }
    }, settleAt)

    timersRef.current.push(settleTimer)

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [packets, replayToken])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [])

  const approachingThreshold = fillLevel >= thresholdLevel - 0.12 && !hasFired

  return (
    <section className="module1-panel module1-section-c-preview">
      <div className="module1-section-c-preview__header">
        <div>
          <p className="module1-eyebrow module1-eyebrow-tight">Animated View</p>
          <h3 className="module1-panel-title">{getStageHeading(scenarioLabel)}</h3>
        </div>
        <p className="module1-card-muted module1-text-reset">{getStageSubcopy(sceneVariant)}</p>
      </div>

      <div className="module1-section-c-preview__grid">
        <div className="module1-section-c__panel module1-section-c__panel--flow">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Signal Flow</p>
            <h4 className="module1-panel-title">Inputs arriving from the scene</h4>
          </div>

          <div className="module1-section-c__flow-stage module1-section-c__flow-stage--scene" aria-hidden="true">
            {sceneNode ? (
              sceneNode
            ) : sceneMarkup ? (
              <div
                className="module1-section-c__flow-scene-art"
                dangerouslySetInnerHTML={{ __html: sceneMarkup }}
              />
            ) : (
              <div className="module1-section-c-preview__generic-scene">
                <div className="module1-section-c-preview__generic-chip-row">
                  {pathLabels.map((label) => (
                    <span key={label} className="module1-section-c__source-preview-chip module1-section-c__source-preview-chip--secondary">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="module1-section-c__flow-current" />
            <div className="module1-section-c__flow-direction-copy">{getSceneDirectionCopy(sceneVariant)}</div>

            {signals.map((signal) => (
              <div
                key={`${replayToken}-${signal.id}`}
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
            <p className="module1-eyebrow module1-eyebrow-tight">Neuron</p>
            <h4 className="module1-panel-title">The soma fills and tests threshold</h4>
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

          <p className="module1-section-c__outcome-copy">{getJourneyOutcomeCopy(outcome, hasFired)}</p>
        </div>
      </div>
    </section>
  )
}

export default SignalJourneyPanel
