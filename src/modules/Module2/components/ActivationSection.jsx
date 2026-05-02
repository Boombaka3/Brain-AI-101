import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

function relu(x) { return Math.max(0, x) }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }

// Map data x ∈ [−3,3] to SVG x within a panel
function toSvgX(x, panelLeft, panelRight) {
  return panelLeft + ((x + 3) / 6) * (panelRight - panelLeft)
}

// ReLU panel: y ∈ [0, 3], mapped inverted to SVG y ∈ [CURVE_BOTTOM, CURVE_TOP]
const CURVE_TOP = 28
const CURVE_BOTTOM = 200
const RELU_Y_MAX = 3.3

// Sigmoid panel: y ∈ [0, 1], mapped inverted
const SIG_Y_MAX = 1.1

// Panel SVG regions
const RELU_LEFT = 50, RELU_RIGHT = 330
const SIG_LEFT = 460, SIG_RIGHT = 740
const ZERO_Y = CURVE_BOTTOM  // SVG y for data y=0

function reluToSvgY(y) {
  return CURVE_BOTTOM - (y / RELU_Y_MAX) * (CURVE_BOTTOM - CURVE_TOP)
}

function sigToSvgY(y) {
  return CURVE_BOTTOM - (y / SIG_Y_MAX) * (CURVE_BOTTOM - CURVE_TOP)
}

function buildPath(fn, toSvgY, panelLeft, panelRight) {
  const pts = []
  for (let x = -3; x <= 3.01; x += 0.1) {
    const y = fn(x)
    pts.push(`${toSvgX(x, panelLeft, panelRight).toFixed(1)},${toSvgY(y).toFixed(1)}`)
  }
  return 'M ' + pts.join(' L ')
}

export default function ActivationSection() {
  const [inputX, setInputX] = useState(1)

  const reluY = relu(inputX)
  const sigY = sigmoid(inputX)

  const reluPath = useMemo(() => buildPath(relu, reluToSvgY, RELU_LEFT, RELU_RIGHT), [])
  const sigPath = useMemo(() => buildPath(sigmoid, sigToSvgY, SIG_LEFT, SIG_RIGHT), [])

  const reluDotX = toSvgX(inputX, RELU_LEFT, RELU_RIGHT)
  const reluDotY = reluToSvgY(reluY)
  const sigDotX = toSvgX(inputX, SIG_LEFT, SIG_RIGHT)
  const sigDotY = sigToSvgY(sigY)

  // Axis positions
  const reluAxisX = toSvgX(0, RELU_LEFT, RELU_RIGHT)
  const sigAxisX = toSvgX(0, SIG_LEFT, SIG_RIGHT)

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">B. Activation Functions</p>
        <h2>The Switch That Matters</h2>
        <p className="m2-section-subtitle">
          Stack neurons with no activation function and you still only get a straight line — no matter how many layers.
          Non-linearity is what lets deep networks learn complex patterns.
        </p>
      </div>

      <div className="m2-section-card">
        <svg viewBox="0 0 800 240" className="m2-svg-block" style={{ maxHeight: 240 }}>
          {/* ── ReLU Panel ── */}
          <rect x="20" y="10" width="360" height="218" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="200" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#7c3aed">ReLU</text>
          <text x="200" y="46" textAnchor="middle" fontSize="11" fill="#94a3b8">f(x) = max(0, x)</text>

          {/* ReLU axes */}
          <line x1={RELU_LEFT} y1={CURVE_BOTTOM} x2={RELU_RIGHT} y2={CURVE_BOTTOM} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={reluAxisX} y1={CURVE_TOP - 8} x2={reluAxisX} y2={CURVE_BOTTOM + 4} stroke="#cbd5e1" strokeWidth={1} />
          <text x={RELU_LEFT - 6} y={CURVE_BOTTOM + 4} textAnchor="end" fontSize="9" fill="#94a3b8">−3</text>
          <text x={RELU_RIGHT + 6} y={CURVE_BOTTOM + 4} textAnchor="start" fontSize="9" fill="#94a3b8">+3</text>
          <text x={reluAxisX} y={CURVE_TOP - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">3</text>
          <text x={reluAxisX - 6} y={CURVE_BOTTOM + 4} textAnchor="end" fontSize="9" fill="#94a3b8">0</text>

          {/* ReLU curve */}
          <path d={reluPath} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* ReLU dot */}
          <motion.circle
            cx={reluDotX}
            cy={reluDotY}
            r={6}
            fill="#7c3aed"
            animate={{ cx: reluDotX, cy: reluDotY }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <motion.line
            x1={reluDotX} y1={reluDotY}
            x2={reluDotX} y2={CURVE_BOTTOM}
            stroke="#7c3aed" strokeWidth={1} strokeDasharray="3 2" opacity={0.5}
            animate={{ x1: reluDotX, x2: reluDotX }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <motion.text
            x={reluDotX}
            y={reluDotY - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#7c3aed"
            animate={{ x: reluDotX, y: reluDotY - 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {reluY.toFixed(2)}
          </motion.text>

          {/* ── Sigmoid Panel ── */}
          <rect x="420" y="10" width="360" height="218" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="600" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#7c3aed">Sigmoid</text>
          <text x="600" y="46" textAnchor="middle" fontSize="11" fill="#94a3b8">f(x) = 1 / (1 + e⁻ˣ)</text>

          {/* Sigmoid axes */}
          <line x1={SIG_LEFT} y1={CURVE_BOTTOM} x2={SIG_RIGHT} y2={CURVE_BOTTOM} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={sigAxisX} y1={CURVE_TOP - 8} x2={sigAxisX} y2={CURVE_BOTTOM + 4} stroke="#cbd5e1" strokeWidth={1} />
          <text x={SIG_LEFT - 6} y={CURVE_BOTTOM + 4} textAnchor="end" fontSize="9" fill="#94a3b8">−3</text>
          <text x={SIG_RIGHT + 6} y={CURVE_BOTTOM + 4} textAnchor="start" fontSize="9" fill="#94a3b8">+3</text>
          <text x={sigAxisX} y={CURVE_TOP - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">1</text>
          <text x={sigAxisX - 6} y={CURVE_BOTTOM + 4} textAnchor="end" fontSize="9" fill="#94a3b8">0</text>

          {/* Sigmoid curve */}
          <path d={sigPath} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Sigmoid dot */}
          <motion.circle
            cx={sigDotX}
            cy={sigDotY}
            r={6}
            fill="#7c3aed"
            animate={{ cx: sigDotX, cy: sigDotY }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <motion.line
            x1={sigDotX} y1={sigDotY}
            x2={sigDotX} y2={CURVE_BOTTOM}
            stroke="#7c3aed" strokeWidth={1} strokeDasharray="3 2" opacity={0.5}
            animate={{ x1: sigDotX, x2: sigDotX }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <motion.text
            x={sigDotX}
            y={sigDotY - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#7c3aed"
            animate={{ x: sigDotX, y: sigDotY - 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {sigY.toFixed(3)}
          </motion.text>
        </svg>

        <div className="m2-act-slider-wrap">
          <label htmlFor="act-slider">Input x = <strong>{inputX > 0 ? '+' : ''}{Number(inputX).toFixed(1)}</strong></label>
          <input
            id="act-slider"
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={inputX}
            onChange={e => setInputX(parseFloat(e.target.value))}
          />
        </div>

        <div className="m2-act-output-row">
          <div className="m2-act-output-box">
            <strong>ReLU output</strong>
            <span>{reluY.toFixed(2)}</span>
          </div>
          <div className="m2-act-output-box">
            <strong>Sigmoid output</strong>
            <span>{sigY.toFixed(3)}</span>
          </div>
        </div>

        <div className="m2-observation">
          <p>
            <strong>ReLU</strong> kills negative signals and passes positives through — cheap to compute, works well in deep networks.{' '}
            <strong>Sigmoid</strong> squashes any input into [0,&nbsp;1] — useful when you want a probability-like output.
            Without either, stacking neurons collapses to a single linear layer no matter how deep you go.
          </p>
        </div>
      </div>
    </section>
  )
}
