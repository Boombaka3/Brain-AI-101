import { useState, useEffect, useMemo, useRef } from 'react'
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

function getPreferredPattern(weights) {
  return weights.map((weight) => (weight > 0 ? 1 : 0))
}

function getMatchDetails(inputPattern, preferredPattern) {
  const activePreferred = preferredPattern.filter(Boolean).length || 1
  const matchCells = preferredPattern.map((value, index) => Boolean(value && inputPattern[index]))
  const matchCount = matchCells.filter(Boolean).length
  return {
    matchCells,
    matchScore: Math.round((matchCount / activePreferred) * 100),
  }
}

function getResponseLabel(output) {
  if (output >= 3) return 'Strong response'
  if (output > 0) return 'Medium response'
  return 'Weak response'
}

function SpecialistsSection() {
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [currentPreset, setCurrentPreset] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [silencedNeurons, setSilencedNeurons] = useState({ alpha: false, beta: false, gamma: false })
  const somaFillRefs = useRef({})

  const neuronOutputs = useMemo(() => Object.entries(NEURON_CONFIGS).map(([key, config]) => {
    const sum = computeWeightedSum(grid, config.weights)
    const isSilenced = silencedNeurons[key]
    const output = isSilenced ? 0 : computeActivation(sum, THRESHOLD, 'relu')
    return { key, ...config, sum, output, isSilenced }
  }), [grid, silencedNeurons])

  const activeOutputs = neuronOutputs.filter(n => !n.isSilenced)
  const maxOutput = activeOutputs.length > 0 ? Math.max(...activeOutputs.map(n => n.output)) : 0
  const dominantNeuron = maxOutput > 0 ? activeOutputs.find(n => n.output === maxOutput)?.key : null
  const dominantOutput = neuronOutputs.find(n => n.key === dominantNeuron)

  const whyRows = useMemo(() => neuronOutputs.map((neuron) => {
    const preferredPattern = getPreferredPattern(neuron.weights)
    const { matchCells, matchScore } = getMatchDetails(grid, preferredPattern)
    return { ...neuron, preferredPattern, matchCells, matchScore }
  }), [grid, neuronOutputs])

  const toggleCell = (i) => {
    const g = [...grid]
    g[i] = g[i] === 0 ? 1 : 0
    setGrid(g)
    setCurrentPreset(null)
    registerActivity()
  }

  const registerActivity = () => {
    setHasInteracted(true)
  }

  const loadPreset = (name) => {
    setGrid([...GRID_PRESETS[name]])
    setCurrentPreset(name)
    registerActivity()
  }

  const toggleSilence = (key) => {
    setSilencedNeurons(prev => ({ ...prev, [key]: !prev[key] }))
    setHasInteracted(true)
  }

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
  }, [grid, neuronOutputs])

  return (
    <section className="m2-section">
      <div className="m2-section-card m2-selectivity-canvas">
        <div className="m2-section-heading m2-canvas-heading">
        <p className="m2-eyebrow">C. Neural Selectivity</p>
        <h2>Some Neurons Prefer Certain Patterns</h2>
        <p className="m2-section-subtitle">Not every neuron responds to the same visual clue. Some respond more strongly to a vertical edge. Others respond to a horizontal edge or a diagonal edge.</p>
      </div>

        <HubelWieselStory />

        <div className="m2-selectivity-bridge">
          <p>
            The same idea appears in artificial networks. Different weights make a neuron more sensitive to some input patterns than others. In the grid below, each artificial neuron has a different preference.
          </p>
          <strong>Try different patterns. Watch which neuron responds most strongly.</strong>
        </div>

        <div className="m2-center-controls" style={{ gap: '8px' }}>
          {hasInteracted && (
            <button
              className={`m2-pill-btn${showInsights ? ' m2-pill-btn--accent' : ''}`}
              onClick={() => setShowInsights(!showInsights)}
              aria-expanded={showInsights}
              aria-controls="m2-why-panel"
            >
              {showInsights ? 'Showing why' : 'Show why'}
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
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>

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

          {neuronOutputs.map(({ key, symbol, revealedName, sum, output, color, isSilenced }, ni) => {
            const nx = 320 + ni * 140
            const fires = sum >= THRESHOLD && !isSilenced
            const effectiveSum = isSilenced ? 0 : sum
            const fillRatio = Math.min(1, effectiveSum / (THRESHOLD * 1.5))
            const fillH = MAX_FILL * fillRatio
            const fillTopY = 200 + NEURON_RADIUS - fillH
            const intensity = Math.min(1, output / 6)

            return (
              <g key={key} opacity={isSilenced ? 0.45 : 1} style={{ cursor: 'pointer' }} onClick={() => toggleSilence(key)}>
                <clipPath id={`somaClip-${key}`}><circle cx={nx} cy={200} r={NEURON_RADIUS - 2} /></clipPath>

                <circle cx={nx} cy={200} r={NEURON_RADIUS} fill={isSilenced ? 'url(#somaGradientSilenced)' : 'url(#somaGradient)'} stroke={isSilenced ? '#94A3B8' : (hasInteracted && output > 0 ? color : '#065F46')} strokeWidth={hasInteracted && output > 0 ? 2 + intensity * 2 : 2} strokeDasharray={isSilenced ? '4 4' : 'none'} />

                {hasInteracted && !isSilenced && (
                  <rect ref={el => somaFillRefs.current[key] = el} x={nx - NEURON_RADIUS} y={fillTopY} width={NEURON_RADIUS * 2} height={fillH} fill={color} clipPath={`url(#somaClip-${key})`} opacity={0.5 + intensity * 0.4} />
                )}

                <circle cx={nx} cy={200} r={NEURON_RADIUS * 0.72} fill="none" stroke={isSilenced ? '#94A3B8' : '#D97706'} strokeWidth={1.5} strokeDasharray="4 3" opacity={isSilenced ? 0.3 : (hasInteracted && fires ? 0.3 : 0.5)} />

                {isSilenced
                  ? <text x={nx} y={208} textAnchor="middle" fontSize="28" fontWeight="700" fill="#94A3B8">x</text>
                  : <text x={nx} y={206} textAnchor="middle" fontSize="22" fontWeight="700" fill={hasInteracted && output > 0 ? color : '#1E293B'}>{symbol}</text>
                }

                {showInsights && !isSilenced && (
                  <text x={nx} y={200 - NEURON_RADIUS - 14} textAnchor="middle" fontSize="10" fontWeight="500" fill={color} fontStyle="italic">
                    responds to {revealedName.toLowerCase()}
                  </text>
                )}

                <g opacity={hasInteracted ? (isSilenced ? 0.35 : 1) : 0.25}>
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

        {showInsights && hasInteracted && (
          <div className="m2-why-panel" id="m2-why-panel">
            <div className="m2-why-panel__intro">
              <h3>Why did this neuron respond?</h3>
              <p>Each neuron has a preferred pattern. It responds more strongly when the input matches that pattern.</p>
            </div>

            <div className="m2-why-comparison" aria-label="Input pattern compared with each neuron's preferred pattern">
              <div className="m2-why-grid-block">
                <span>Input pattern</span>
                <div className="m2-why-mini-grid" aria-label="Current input pattern">
                  {grid.map((value, index) => (
                    <span key={index} className={value ? 'is-active' : ''}>{value}</span>
                  ))}
                </div>
              </div>

              {whyRows.map(({ key, symbol, revealedName, color, output, isSilenced, preferredPattern, matchCells, matchScore }) => {
                const isBest = key === dominantNeuron
                return (
                  <div className={`m2-why-grid-block${isBest ? ' is-best' : ''}`} key={key}>
                    <span>{symbol} preferred pattern</span>
                    <div className="m2-why-mini-grid" aria-label={`${symbol} preferred ${revealedName.toLowerCase()} pattern`}>
                      {preferredPattern.map((value, index) => (
                        <span
                          key={index}
                          className={[
                            value ? 'is-preferred' : '',
                            matchCells[index] ? 'is-match' : '',
                          ].filter(Boolean).join(' ')}
                          style={matchCells[index] ? { '--match-color': color } : undefined}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                    <strong>{isBest ? 'Best match' : `${matchScore}% match`}</strong>
                    <em>{isSilenced ? 'Silenced' : getResponseLabel(output)}</em>
                  </div>
                )
              })}
            </div>

            <p className="m2-why-panel__result">
              {dominantOutput
                ? `${dominantOutput.symbol} responded most strongly because the input pattern matched its preferred ${dominantOutput.revealedName.toLowerCase()} pattern best.`
                : 'No neuron has a strong match yet. Try a pattern preset or turn on cells in the input grid.'}
            </p>
            <p className="m2-why-panel__bridge">
              This is similar to how a CNN layer uses filters. A filter checks for a feature, such as an edge or angle. When the feature matches the input, the response becomes stronger.
            </p>
          </div>
        )}

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

        <div className="m2-observation">
          <p>Same input grid. Different weights. Different preference.</p>
        </div>

        <p className="m2-hint">
          {hasInteracted
            ? 'Click a neuron to silence or restore it. Try another pattern to compare the response strengths.'
            : 'Click cells or use pattern presets below.'}
        </p>
      </div>
    </section>
  )
}

export default SpecialistsSection
