import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import HubelWieselStory from './HubelWieselStory'
import {
  NEURON_CONFIGS, THRESHOLD, RELU_SCALE, GRID_PRESETS,
  computeWeightedSum, computeActivation
} from '../module2Config'

const NEURON_RADIUS = 50
const SVG_W = 800
const SVG_H = 420
const GRID_X = 60
const GRID_Y = 120
const CELL = 44
const MAX_FILL = NEURON_RADIUS * 2 * 0.85

function SpecialistsSection() {
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [currentPreset, setCurrentPreset] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [showInsights, setShowInsights] = useState(false)
  const [silencedNeurons, setSilencedNeurons] = useState({ alpha: false, beta: false, gamma: false })
  const [dropoutMode, setDropoutMode] = useState(false)
  const [dropoutTarget, setDropoutTarget] = useState(null)
  const somaFillRefs = useRef({})

  const canShowInsights = interactionCount >= 5

  const getEffectiveSilence = (key) => {
    if (dropoutMode && dropoutTarget === key) return true
    if (!dropoutMode && silencedNeurons[key]) return true
    return false
  }

  const neuronOutputs = Object.entries(NEURON_CONFIGS).map(([key, config]) => {
    const sum = computeWeightedSum(grid, config.weights)
    const isSilenced = getEffectiveSilence(key)
    const output = isSilenced ? 0 : computeActivation(sum, THRESHOLD, 'relu')
    return { key, ...config, sum, output, isSilenced }
  })

  const activeOutputs = neuronOutputs.filter(n => !n.isSilenced)
  const maxOutput = activeOutputs.length > 0 ? Math.max(...activeOutputs.map(n => n.output)) : 0
  const dominantNeuron = maxOutput > 0 ? activeOutputs.find(n => n.output === maxOutput)?.key : null

  const toggleCell = (i) => {
    const g = [...grid]
    g[i] = g[i] === 0 ? 1 : 0
    setGrid(g)
    setCurrentPreset(null)
    setHasInteracted(true)
    setInteractionCount(c => c + 1)
  }

  const loadPreset = (name) => {
    setGrid([...GRID_PRESETS[name]])
    setCurrentPreset(name)
    setHasInteracted(true)
    setInteractionCount(c => c + 1)
    if (dropoutMode) {
      const keys = Object.keys(NEURON_CONFIGS)
      setDropoutTarget(keys[Math.floor(Math.random() * keys.length)])
    }
  }

  const toggleSilence = (key) => {
    if (dropoutMode) return
    setSilencedNeurons(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    if (!dropoutMode) setDropoutTarget(null)
  }, [dropoutMode])

  useEffect(() => {
    neuronOutputs.forEach(({ key, sum, isSilenced }) => {
      const ref = somaFillRefs.current[key]
      if (!ref) return
      const effectiveSum = isSilenced ? 0 : sum
      const ratio = Math.min(1, effectiveSum / (THRESHOLD * 1.5))
      const h = MAX_FILL * ratio
      const topY = 200 + NEURON_RADIUS - h
      gsap.to(ref, { attr: { y: topY, height: Math.max(0, h) }, duration: 0.25, ease: 'power2.out' })
    })
  }, [grid, silencedNeurons, dropoutTarget])

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">C. Selectivity & Dropout</p>
        <h2>Neural Selectivity: Weights Create Preferences</h2>
        <p className="m2-section-subtitle">Each neuron has different weights, so each responds to different patterns. Toggle dropout to see why redundancy matters.</p>
      </div>

      <HubelWieselStory />

      <div className="m2-section-card">
        {/* Controls */}
        <div className="m2-center-controls" style={{ gap: '8px' }}>
          <button
            className={`m2-pill-btn${dropoutMode ? ' m2-pill-btn--warn' : ''}`}
            onClick={() => setDropoutMode(!dropoutMode)}
          >
            {dropoutMode ? '⚡ Random Silence ON' : '○ Random Silence OFF'}
          </button>
          {canShowInsights && (
            <button
              className={`m2-pill-btn${showInsights ? ' m2-pill-btn--accent' : ''}`}
              onClick={() => setShowInsights(!showInsights)}
            >
              {showInsights ? '✓ Showing why' : '? Show why'}
            </button>
          )}
        </div>

        <svg width={SVG_W} height={SVG_H} className="m2-svg-block">
          <defs>
            <radialGradient id="somaGradient" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="70%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <radialGradient id="somaGradientSilenced" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>

          {/* Input grid */}
          <g>
            <text x={GRID_X + CELL * 1.5} y={GRID_Y - 25} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1E293B">Input Pattern</text>
            {grid.map((val, i) => {
              const row = Math.floor(i / 3), col = i % 3
              const x = GRID_X + col * CELL, y = GRID_Y + row * CELL
              return (
                <g key={i} style={{ cursor: 'pointer' }} onClick={() => toggleCell(i)}>
                  <rect x={x} y={y} width={CELL - 4} height={CELL - 4} rx={5} fill={val ? '#3B82F6' : '#F1F5F9'} stroke={val ? '#2563EB' : '#E2E8F0'} strokeWidth={2} />
                  <text x={x + (CELL - 4) / 2} y={y + (CELL - 4) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill={val ? 'white' : '#94A3B8'}>{val}</text>
                </g>
              )
            })}
          </g>

          {/* Connections per neuron */}
          {neuronOutputs.map(({ key, isSilenced }, ni) => (
            <g key={`conn-${key}`} opacity={isSilenced ? 0.2 : 1}>
              {grid.map((val, i) => {
                const row = Math.floor(i / 3), col = i % 3
                const sx = GRID_X + col * CELL + (CELL - 4) / 2
                const sy = GRID_Y + row * CELL + (CELL - 4) / 2
                const nx = 320 + ni * 140
                return <path key={`${key}-${i}`} d={`M ${sx + 20} ${sy} Q ${200 + ni * 20} ${sy}, ${nx - 45} ${200 - 15 + row * 15}`} fill="none" stroke={val ? '#94A3B8' : '#E2E8F0'} strokeWidth={1} opacity={val ? 0.4 : 0.15} />
              })}
            </g>
          ))}

          {/* Neurons */}
          {neuronOutputs.map(({ key, symbol, revealedName, sum, output, color, isSilenced }, ni) => {
            const nx = 320 + ni * 140
            const fires = sum >= THRESHOLD && !isSilenced
            const effectiveSum = isSilenced ? 0 : sum
            const fillRatio = Math.min(1, effectiveSum / (THRESHOLD * 1.5))
            const fillH = MAX_FILL * fillRatio
            const fillTopY = 200 + NEURON_RADIUS - fillH
            const intensity = Math.min(1, output / 6)
            const glowOpacity = hasInteracted ? (0.3 + intensity * 0.5) : 0.2

            return (
              <g key={key} opacity={isSilenced ? 0.4 : 1} style={{ cursor: dropoutMode ? 'default' : 'pointer' }} onClick={() => toggleSilence(key)}>
                <clipPath id={`somaClip-${key}`}><circle cx={nx} cy={200} r={NEURON_RADIUS - 2} /></clipPath>

                {hasInteracted && output > 0 && !isSilenced && (
                  <circle cx={nx} cy={200} r={NEURON_RADIUS + 8 + intensity * 6} fill="none" stroke={color} strokeWidth={2 + intensity * 3} opacity={glowOpacity} />
                )}

                <circle cx={nx} cy={200} r={NEURON_RADIUS} fill={isSilenced ? 'url(#somaGradientSilenced)' : 'url(#somaGradient)'} stroke={isSilenced ? '#94A3B8' : (hasInteracted && output > 0 ? color : '#065F46')} strokeWidth={isSilenced ? 2 : (hasInteracted && output > 0 ? 2 + intensity * 2 : 2)} strokeDasharray={isSilenced ? '4 4' : 'none'} />

                {hasInteracted && !isSilenced && (
                  <rect ref={el => somaFillRefs.current[key] = el} x={nx - NEURON_RADIUS} y={fillTopY} width={NEURON_RADIUS * 2} height={fillH} fill={color} clipPath={`url(#somaClip-${key})`} opacity={0.5 + intensity * 0.4} />
                )}

                <circle cx={nx} cy={200} r={NEURON_RADIUS * 0.72} fill="none" stroke={isSilenced ? '#94A3B8' : '#D97706'} strokeWidth={1.5} strokeDasharray="4 3" opacity={isSilenced ? 0.3 : (hasInteracted && fires ? 0.3 : 0.5)} />

                {isSilenced
                  ? <text x={nx} y={208} textAnchor="middle" fontSize="28" fontWeight="700" fill="#94A3B8">✕</text>
                  : <text x={nx} y={206} textAnchor="middle" fontSize="22" fontWeight="700" fill={hasInteracted && output > 0 ? color : '#1E293B'}>{symbol}</text>
                }

                {showInsights && !isSilenced && (
                  <text x={nx} y={200 - NEURON_RADIUS - 14} textAnchor="middle" fontSize="10" fontWeight="500" fill={color} fontStyle="italic">
                    responds to {revealedName.toLowerCase()}
                  </text>
                )}

                {/* Output bar */}
                <g opacity={hasInteracted ? (isSilenced ? 0.3 : 1) : 0.25}>
                  <rect x={nx - 10} y={260} width={20} height={55} fill="#F1F5F9" stroke="#E2E8F0" rx={4} />
                  {hasInteracted && (
                    <rect x={nx - 10} y={315 - Math.min(1, output * RELU_SCALE) * 55} width={20} height={Math.min(1, output * RELU_SCALE) * 55} fill={isSilenced ? '#94A3B8' : color} rx={4} opacity={isSilenced ? 0.4 : (0.6 + intensity * 0.4)} />
                  )}
                  <text x={nx} y={330} textAnchor="middle" fontSize="10" fontWeight="600" fill={hasInteracted && output > 0 ? color : '#94A3B8'}>
                    {hasInteracted ? output.toFixed(1) : '?'}
                  </text>
                </g>

                {isSilenced && <text x={nx} y={348} textAnchor="middle" fontSize="9" fontWeight="500" fill="#94A3B8">silenced</text>}
              </g>
            )
          })}
        </svg>

        {/* Presets */}
        <div className="m2-preset-row">
          <span className="m2-preset-label">Patterns:</span>
          {Object.keys(GRID_PRESETS).map(name => (
            <button
              key={name}
              className={`m2-preset-btn${currentPreset === name ? ' m2-preset-btn--active' : ''}`}
              onClick={() => loadPreset(name)}
            >
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Dropout callout */}
        {dropoutMode && (
          <div className="m2-dropout-callout">
            <strong>Dropout:</strong> Randomly silencing neurons during training forces the network to build redundant pathways — like training with one hand behind your back. The network learns to never rely on any single neuron.
          </div>
        )}

        {/* Observation */}
        <div className="m2-observation">
          <p>
            {!hasInteracted
              ? <>Same inputs, different weights → different selectivity.</>
              : <>Each neuron&apos;s weights determine what pattern it responds to best.</>
            }
          </p>
        </div>

        {showInsights && dominantNeuron && (
          <p className="m2-insight-text" style={{ marginTop: 8 }}>
            {NEURON_CONFIGS[dominantNeuron].symbol} consistently responds more to {NEURON_CONFIGS[dominantNeuron].revealedName.toLowerCase()} structures.
          </p>
        )}

        <p className="m2-hint">
          {hasInteracted
            ? 'Click a neuron to silence it. Different weights = different selectivity.'
            : 'Click cells or use pattern presets below.'}
        </p>
      </div>
    </section>
  )
}

export default SpecialistsSection
