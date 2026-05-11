import { useState } from 'react'
import { motion } from 'framer-motion'

const STAGE_LABELS = ['One Neuron', 'A Hidden Layer', 'Two Layers', 'Deep Network']

const STAGE_DESCS = [
  'A single artificial neuron receives inputs, gives each input a weight, and combines them into one output. This connects back to Module 1: a biological neuron fired only when enough signal reached its threshold. In an artificial neuron, activation plays a similar role.',
  'A layer of neurons processes the same inputs in parallel. Each neuron has different weights, so each detects something different.',
  "The hidden layer's output becomes the next layer's input. Now the network can detect combinations of features that no single neuron could see alone.",
  'Stack enough layers and you have a deep neural network. Early layers detect simple patterns; later layers build more complex ideas from them.',
]

const STAGE_BUTTONS = ['Add a Layer ->', 'Add Output ->', 'Go Deeper ->', null]

const INPUTS = [[60, 110], [60, 200], [60, 290]]
const HIDDEN1 = [[220, 80], [220, 150], [220, 220], [220, 290]]
const HIDDEN2 = [[390, 110], [390, 200], [390, 290]]
const OUTPUTS_SHALLOW = [[430, 155], [430, 245]]
const OUTPUTS_DEEP = [[540, 155], [540, 245]]
const SINGLE_NEURON_POS = [310, 200]

export default function ANNSection() {
  const [stage, setStage] = useState(0)

  const isStage0 = stage === 0
  const showH2 = stage >= 3
  const showOut = stage >= 2
  const outputs = showH2 ? OUTPUTS_DEEP : OUTPUTS_SHALLOW

  return (
    <section className="m2-section">
      <div className="m2-section-card">
        <div className="m2-opening-hero m2-opening-hero--card">
          <div className="m2-opening-hero-inner">
            <p className="m2-opening-kicker">MODULE 2</p>
            <h2 className="m2-opening-headline">
              What Can a Network See
              <br />
              That One Neuron Cannot?
            </h2>
            <p className="m2-opening-subtitle">From one artificial neuron to networks.</p>
          </div>
          <div className="m2-opening-orb" aria-hidden="true" />
        </div>

        <div className="m2-ann-stage-info">
          <p className="m2-ann-stage-label">{STAGE_LABELS[stage]}</p>
          <p className="m2-ann-stage-desc">{STAGE_DESCS[stage]}</p>
        </div>

        <svg viewBox="0 0 620 360" className="m2-svg-block" style={{ maxHeight: 300 }}>
          <defs>
            <marker id="ann-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c7d2fe" />
            </marker>
          </defs>

          {isStage0 && (
            <motion.g key="stage0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {INPUTS.map(([x, y], i) => (
                <line key={i} x1={x + 18} y1={y} x2={SINGLE_NEURON_POS[0] - 30} y2={SINGLE_NEURON_POS[1]} stroke="#c7d2fe" strokeWidth={1.5} />
              ))}
              {INPUTS.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={18} fill="#eff6ff" stroke="#3b82f6" strokeWidth={2} />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">x{i + 1}</text>
                </g>
              ))}
              <circle cx={SINGLE_NEURON_POS[0]} cy={SINGLE_NEURON_POS[1]} r={30} fill="#f3e8ff" stroke="#7c3aed" strokeWidth={2.5} />
              <text x={SINGLE_NEURON_POS[0]} y={SINGLE_NEURON_POS[1] + 5} textAnchor="middle" fontSize="13" fill="#6d28d9" fontWeight="700">N</text>
              <line x1={SINGLE_NEURON_POS[0] + 30} y1={SINGLE_NEURON_POS[1]} x2={SINGLE_NEURON_POS[0] + 85} y2={SINGLE_NEURON_POS[1]} stroke="#c7d2fe" strokeWidth={1.5} markerEnd="url(#ann-arrow)" />
              <text x={SINGLE_NEURON_POS[0] + 100} y={SINGLE_NEURON_POS[1] + 5} fontSize="12" fill="#4b5563">output</text>
              <text x={310} y={340} textAnchor="middle" fontSize="11" fill="#94a3b8" fontStyle="italic">One neuron - one weighted decision</text>
            </motion.g>
          )}

          {!isStage0 && (
            <motion.g key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {INPUTS.map(([ix, iy]) =>
                HIDDEN1.map(([hx, hy], j) => (
                  <line key={`e1-${ix}-${j}`} x1={ix + 18} y1={iy} x2={hx - 18} y2={hy} stroke="#e2e8f0" strokeWidth={1} />
                ))
              )}

              {showH2 && HIDDEN1.map(([hx, hy]) =>
                HIDDEN2.map(([h2x, h2y], j) => (
                  <line key={`e2-${hx}-${j}`} x1={hx + 18} y1={hy} x2={h2x - 18} y2={h2y} stroke="#e2e8f0" strokeWidth={1} />
                ))
              )}

              {showOut && (showH2 ? HIDDEN2 : HIDDEN1).map(([hx, hy]) =>
                outputs.map(([ox, oy], j) => (
                  <line key={`eout-${hx}-${j}`} x1={hx + 18} y1={hy} x2={ox - 18} y2={oy} stroke="#e2e8f0" strokeWidth={1} />
                ))
              )}

              {INPUTS.map(([x, y], i) => (
                <g key={`in-${i}`}>
                  <circle cx={x} cy={y} r={18} fill="#eff6ff" stroke="#3b82f6" strokeWidth={2} />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">x{i + 1}</text>
                </g>
              ))}

              {HIDDEN1.map(([x, y], i) => (
                <g key={`h1-${i}`}>
                  <circle cx={x} cy={y} r={18} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={2} />
                </g>
              ))}

              {showH2 && HIDDEN2.map(([x, y], i) => (
                <motion.g key={`h2-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                  <circle cx={x} cy={y} r={18} fill="#fdf4ff" stroke="#a855f7" strokeWidth={2} />
                </motion.g>
              ))}

              {showOut && outputs.map(([ox, oy], i) => (
                <motion.g key={`out-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <circle cx={ox} cy={oy} r={18} fill="#f0fdf4" stroke="#059669" strokeWidth={2} />
                  <text x={ox} y={oy + 5} textAnchor="middle" fontSize="10" fill="#065f46" fontWeight="600">y{i + 1}</text>
                </motion.g>
              ))}

              <text x={60} y={330} textAnchor="middle" fontSize="11" fill="#94a3b8">Inputs</text>
              <text x={220} y={330} textAnchor="middle" fontSize="11" fill="#94a3b8">Hidden</text>
              {showH2 && <text x={390} y={330} textAnchor="middle" fontSize="11" fill="#94a3b8">Hidden 2</text>}
              {showOut && <text x={outputs[0][0]} y={330} textAnchor="middle" fontSize="11" fill="#94a3b8">Output</text>}
            </motion.g>
          )}
        </svg>

        <div className="m2-controls">
          {STAGE_BUTTONS[stage] && (
            <button className="m2-pill-btn m2-pill-btn--accent" onClick={() => setStage((s) => Math.min(3, s + 1))}>
              {STAGE_BUTTONS[stage]}
            </button>
          )}
          {stage > 0 && (
            <button className="m2-pill-btn" onClick={() => setStage(0)}>Reset</button>
          )}
        </div>

        <div className="m2-observation">
          <p>A network combines many simple decisions. Each layer can notice a different part of the pattern.</p>
        </div>
      </div>
    </section>
  )
}
