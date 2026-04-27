import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  SINGLE_WEIGHTS, THRESHOLD, SMOOTH_LOW, SMOOTH_HIGH,
  GRID_PRESETS, computeOutput, computeWeightedSum, getDisplayOutput
} from '../module2Config'

const NEURON_RADIUS = 50
const SVG_W = 800
const SVG_H = 420
const GRID_X = 60
const GRID_Y = 120
const CELL = 44

function WeightsSection() {
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [outputMode, setOutputMode] = useState('yesno')
  const [currentPreset, setCurrentPreset] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const somaFillRef = useRef(null)
  const somaFillLineRef = useRef(null)

  const sum = computeWeightedSum(grid, SINGLE_WEIGHTS)
  const output = computeOutput(sum, THRESHOLD, outputMode)
  const fires = output > 0

  const toggleCell = (i) => {
    const g = [...grid]
    g[i] = g[i] === 0 ? 1 : 0
    setGrid(g)
    setCurrentPreset(null)
    setHasInteracted(true)
  }

  const loadPreset = (name) => {
    setGrid([...GRID_PRESETS[name]])
    setCurrentPreset(name)
    setHasInteracted(true)
  }

  useEffect(() => {
    const maxFill = NEURON_RADIUS * 2 * 0.85
    const ratio = Math.min(1, sum / (THRESHOLD * 1.5))
    const h = maxFill * ratio
    const topY = 200 + NEURON_RADIUS - h

    if (somaFillRef.current) {
      gsap.to(somaFillRef.current, { attr: { y: topY, height: Math.max(0, h) }, duration: 0.25, ease: 'power2.out' })
    }
    if (somaFillLineRef.current) {
      gsap.to(somaFillLineRef.current, { attr: { y1: topY, y2: topY }, duration: 0.25, ease: 'power2.out' })
    }
  }, [sum])

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">B. Weights</p>
        <h2>One Neuron + Weights = Selectivity</h2>
        <p className="m2-section-subtitle">Weights make some inputs count more than others.</p>
      </div>

      <div className="m2-section-card">
        {/* Output mode tabs */}
        <div className="m2-center-controls">
          <div className="m2-mode-tabs">
            {[
              { key: 'yesno', label: 'Yes / No' },
              { key: 'smooth', label: 'Smooth' },
              { key: 'proportional', label: 'Proportional' }
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`m2-mode-tab${outputMode === key ? ' m2-mode-tab--active' : ''}`}
                onClick={() => setOutputMode(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="m2-hint">Same inputs and weights — only the decision rule changes.</p>
        </div>

        <svg width={SVG_W} height={SVG_H} className="m2-svg-block">
          <defs>
            <radialGradient id="somaGradSingle" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="70%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <clipPath id="somaClipSingle"><circle cx={450} cy={200} r={NEURON_RADIUS - 2} /></clipPath>
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
            <text x={GRID_X + CELL * 1.5} y={GRID_Y + CELL * 3 + 18} textAnchor="middle" fontSize="10" fill="#94A3B8">click to toggle</text>
          </g>

          {/* Connections */}
          {grid.map((val, i) => {
            const row = Math.floor(i / 3), col = i % 3
            const sx = GRID_X + col * CELL + (CELL - 4) / 2
            const sy = GRID_Y + row * CELL + (CELL - 4) / 2
            return <path key={i} d={`M ${sx + 20} ${sy} Q ${(sx + 400) / 2 + 20} ${sy}, ${400} ${200 - 20 + row * 20}`} fill="none" stroke={val ? '#3B82F6' : '#E2E8F0'} strokeWidth={val ? 2 : 1} opacity={val ? 0.6 : 0.25} />
          })}

          {/* Neuron */}
          <g>
            <circle cx={450} cy={200} r={NEURON_RADIUS} fill="url(#somaGradSingle)" stroke={hasInteracted && fires ? '#047857' : '#065F46'} strokeWidth={hasInteracted && fires ? 3 : 2} />
            {hasInteracted && (
              <>
                <rect ref={somaFillRef} x={400} y={250} width={100} height={0} fill={fires ? '#10B981' : '#34D399'} clipPath="url(#somaClipSingle)" opacity={0.8} />
                <line ref={somaFillLineRef} x1={408} x2={492} y1={250} y2={250} stroke="#059669" strokeWidth={1.5} clipPath="url(#somaClipSingle)" opacity={0.5} />
              </>
            )}
            <circle cx={450} cy={200} r={NEURON_RADIUS * 0.72} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="5 3" opacity={hasInteracted && fires ? 0.3 : 0.55} />
            <text x={450} y={188 - NEURON_RADIUS} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1E293B">Neuron</text>
            <text x={450} y={228 + NEURON_RADIUS} textAnchor="middle" fontSize="12" fill="#1E293B">
              sum = <tspan fontWeight="700">{hasInteracted ? sum : '?'}</tspan>
            </text>
          </g>

          {/* Output */}
          <g opacity={hasInteracted ? 1 : 0.3}>
            <line x1={500} y1={200} x2={550} y2={200} stroke={hasInteracted && output > 0 ? '#10B981' : '#CBD5E1'} strokeWidth={2} />

            {outputMode === 'yesno' && (
              <>
                <circle cx={580} cy={200} r={hasInteracted && output ? 22 : 14} fill={hasInteracted && output ? '#10B981' : '#F1F5F9'} stroke={hasInteracted && output ? '#047857' : '#CBD5E1'} strokeWidth={2} />
                <text x={580} y={206} textAnchor="middle" fontSize="18" fontWeight="700" fill={hasInteracted && output ? 'white' : '#94A3B8'}>
                  {hasInteracted ? (output ? '1' : '0') : '?'}
                </text>
                <text x={580} y={235} textAnchor="middle" fontSize="9" fill="#64748B">
                  {hasInteracted ? (output ? 'YES' : 'NO') : ''}
                </text>
              </>
            )}

            {outputMode === 'smooth' && (() => {
              const barH = 70
              const fillH = hasInteracted ? output * barH : 0
              const fc = output > 0.5 ? '#10B981' : (output > 0 ? '#34D399' : '#E2E8F0')
              return (
                <>
                  <rect x={565} y={165} width={30} height={barH} fill="#F1F5F9" stroke="#E2E8F0" rx={4} />
                  {hasInteracted && <rect x={565} y={165 + barH - fillH} width={30} height={fillH} fill={fc} rx={4} />}
                  <text x={580} y={155} textAnchor="middle" fontSize="12" fontWeight="700" fill={output > 0.5 ? '#047857' : '#64748B'}>
                    {hasInteracted ? getDisplayOutput(output, 'smooth') : '?'}
                  </text>
                  <text x={580} y={250} textAnchor="middle" fontSize="9" fill="#94A3B8">gradual</text>
                </>
              )
            })()}

            {outputMode === 'proportional' && (() => {
              const maxSz = 28, minSz = 12
              const ratio = Math.min(1, output / 6)
              const sz = hasInteracted ? minSz + ratio * (maxSz - minSz) : minSz
              const overflow = output > 6
              const fc = output > 0 ? (overflow ? '#8B5CF6' : '#10B981') : '#F1F5F9'
              const sc = output > 0 ? (overflow ? '#6D28D9' : '#047857') : '#CBD5E1'
              return (
                <>
                  <rect x={580 - sz / 2} y={200 - sz / 2} width={sz} height={sz} fill={hasInteracted ? fc : '#F1F5F9'} stroke={hasInteracted ? sc : '#CBD5E1'} strokeWidth={2} rx={4} />
                  <text x={580} y={205} textAnchor="middle" fontSize={sz > 20 ? '14' : '11'} fontWeight="700" fill={output > 0 ? 'white' : '#94A3B8'}>
                    {hasInteracted ? getDisplayOutput(output, 'proportional') : '?'}
                  </text>
                  {hasInteracted && overflow && <text x={580} y={235} textAnchor="middle" fontSize="9" fill="#8B5CF6" fontWeight="600">overflow!</text>}
                  <text x={580} y={overflow ? 248 : 235} textAnchor="middle" fontSize="9" fill="#94A3B8">scales with sum</text>
                </>
              )
            })()}

            <text x={580} y={268} textAnchor="middle" fontSize="10" fontWeight="500" fill="#475569">output</text>
          </g>
        </svg>

        {/* Pattern presets */}
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

        {/* Observation */}
        <div className="m2-observation">
          <p>
            {!hasInteracted
              ? <><strong>Click a cell</strong> to activate it. Watch how weights multiply the input.</>
              : outputMode === 'yesno'
                ? <>Weighted sum = {sum}. {sum >= THRESHOLD ? 'Reaches threshold → YES' : 'Below threshold → NO'}</>
                : outputMode === 'smooth'
                  ? <>Weighted sum = {sum}. Response increases smoothly from {SMOOTH_LOW} to {SMOOTH_HIGH}.</>
                  : <>Weighted sum = {sum}. Output scales with the sum (selectivity!).</>
            }
          </p>
        </div>

        <p className="m2-hint">
          {hasInteracted
            ? 'Switch modes to see different decision rules for the same weighted sum.'
            : 'Toggle cells to build up the weighted sum.'}
        </p>
      </div>
    </section>
  )
}

export default WeightsSection
