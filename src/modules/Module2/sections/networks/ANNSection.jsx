import { useId, useState } from 'react'
import { motion } from 'framer-motion'

const STAGE_LABELS = ['One Neuron', 'Input to Hidden Layer', 'Hidden to Output Layer', 'Deep Network']

const STAGE_DESCS = [
  'A single artificial neuron receives signals from the input layer, combines them with weights, and produces one output.',
  'A hidden layer lets several neurons inspect the same inputs in parallel. Different weights make different neurons notice different clues.',
  'Signals move forward from the input layer, through hidden neurons, to the output layer. The network can now combine simpler clues into a stronger decision.',
  'With more layers, early neurons can respond to simple features while later layers combine those responses into the kinds of filters and feature detectors you will see later in Module 2.',
]

const STAGE_BUTTONS = ['Add Hidden Layer ->', 'Add Output Layer ->', 'Go Deeper ->', null]

const SVG_VIEWBOX = '0 0 860 420'
const INPUTS = [
  { x: 100, y: 120, label: 'x1' },
  { x: 100, y: 210, label: 'x2' },
  { x: 100, y: 300, label: 'x3' },
]
const HIDDEN1 = [
  { x: 310, y: 90, label: 'h1' },
  { x: 310, y: 170, label: 'h2' },
  { x: 310, y: 250, label: 'h3' },
  { x: 310, y: 330, label: 'h4' },
]
const HIDDEN2 = [
  { x: 530, y: 120, label: 'h5' },
  { x: 530, y: 210, label: 'h6' },
  { x: 530, y: 300, label: 'h7' },
]
const OUTPUTS_SHALLOW = [
  { x: 730, y: 160, label: 'y1' },
  { x: 730, y: 260, label: 'y2' },
]
const OUTPUTS_DEEP = [
  { x: 760, y: 160, label: 'y1' },
  { x: 760, y: 260, label: 'y2' },
]
const SINGLE_NEURON = { x: 430, y: 210, label: 'n' }

function LayerTag({ x, y, label }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-54" y="-16" width="108" height="32" rx="16" fill="rgba(255,255,255,0.9)" stroke="#ddd6fe" />
      <text textAnchor="middle" fontSize="12" fontWeight="700" fill="#5b21b6">{label}</text>
    </g>
  )
}

function Connection({ from, to, stroke = '#cbd5e1', width = 2.1, opacity = 0.8 }) {
  const dx = to.x - from.x
  const curve = Math.max(28, Math.min(72, dx * 0.24))
  const d = `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
    />
  )
}

function NeuronNode({ x, y, r, fill, stroke, textColor, label, ring = false }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
      {ring && <circle cx={x} cy={y} r={r + 10} fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.18} />}
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={textColor}>{label}</text>
    </g>
  )
}

export default function ANNSection() {
  const [stage, setStage] = useState(0)
  const markerId = useId()

  const isStage0 = stage === 0
  const showH2 = stage >= 3
  const showOut = stage >= 2
  const outputs = showH2 ? OUTPUTS_DEEP : OUTPUTS_SHALLOW
  const outputSources = showH2 ? HIDDEN2 : HIDDEN1

  return (
    <section className="m2-section">
      <div className="m2-section-card">
        <div className="m2-opening-hero m2-opening-hero--card">
          <div className="m2-opening-hero-inner">
            <p className="m2-opening-kicker">A. Neural Networks</p>
            <h2 className="m2-opening-headline">
              What Can a Network See
              <br />
              That One Neuron Cannot?
            </h2>
            <p className="m2-opening-subtitle">
              A neural network is made of connected artificial neurons. Signals move from the input layer, through hidden neurons, to the output layer.
            </p>
          </div>
          <div className="m2-opening-orb" aria-hidden="true" />
        </div>

        <div className="m2-ann-stage-info">
          <p className="m2-ann-stage-label">{STAGE_LABELS[stage]}</p>
          <p className="m2-ann-stage-desc">{STAGE_DESCS[stage]}</p>
        </div>

        <div className="m2-ann-network-frame">
          <svg viewBox={SVG_VIEWBOX} className="m2-svg-block m2-ann-svg" aria-label="Artificial neural network diagram">
            <defs>
              <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
              </marker>
            </defs>

            {isStage0 && (
              <motion.g key="stage0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LayerTag x={100} y={52} label="Input Layer" />
                <LayerTag x={430} y={52} label="Artificial Neuron" />

                {INPUTS.map((node) => (
                  <Connection
                    key={`single-conn-${node.label}`}
                    from={{ x: node.x + 28, y: node.y }}
                    to={{ x: SINGLE_NEURON.x - 42, y: SINGLE_NEURON.y }}
                    stroke="#bfdbfe"
                    width={2.4}
                    opacity={0.95}
                  />
                ))}

                {INPUTS.map((node) => (
                  <NeuronNode
                    key={node.label}
                    x={node.x}
                    y={node.y}
                    r={28}
                    fill="#eff6ff"
                    stroke="#3b82f6"
                    textColor="#1d4ed8"
                    label={node.label}
                  />
                ))}

                <NeuronNode
                  x={SINGLE_NEURON.x}
                  y={SINGLE_NEURON.y}
                  r={40}
                  fill="#f5f3ff"
                  stroke="#7c3aed"
                  textColor="#6d28d9"
                  label="n"
                  ring
                />

                <path
                  d={`M ${SINGLE_NEURON.x + 42} ${SINGLE_NEURON.y} C ${SINGLE_NEURON.x + 88} ${SINGLE_NEURON.y}, ${SINGLE_NEURON.x + 112} ${SINGLE_NEURON.y}, ${SINGLE_NEURON.x + 152} ${SINGLE_NEURON.y}`}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                />
                <text x={SINGLE_NEURON.x + 174} y={SINGLE_NEURON.y + 5} fontSize="13" fontWeight="700" fill="#166534">output</text>
                <text x="430" y="388" textAnchor="middle" fontSize="13" fill="#64748b">
                  One neuron makes one weighted decision.
                </text>
              </motion.g>
            )}

            {!isStage0 && (
              <motion.g key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LayerTag x={100} y={52} label="Input Layer" />
                <LayerTag x={310} y={52} label="Hidden Layer" />
                {showH2 && <LayerTag x={530} y={52} label="Hidden Layer 2" />}
                {showOut && <LayerTag x={outputs[0].x} y={52} label="Output Layer" />}

                {INPUTS.flatMap((inputNode) =>
                  HIDDEN1.map((hiddenNode) => (
                    <Connection
                      key={`conn-i-${inputNode.label}-${hiddenNode.label}`}
                      from={{ x: inputNode.x + 28, y: inputNode.y }}
                      to={{ x: hiddenNode.x - 28, y: hiddenNode.y }}
                    />
                  ))
                )}

                {showH2 && HIDDEN1.flatMap((fromNode) =>
                  HIDDEN2.map((toNode) => (
                    <Connection
                      key={`conn-h1-${fromNode.label}-${toNode.label}`}
                      from={{ x: fromNode.x + 28, y: fromNode.y }}
                      to={{ x: toNode.x - 28, y: toNode.y }}
                      stroke="#d8b4fe"
                    />
                  ))
                )}

                {showOut && outputSources.flatMap((fromNode) =>
                  outputs.map((toNode) => (
                    <Connection
                      key={`conn-out-${fromNode.label}-${toNode.label}`}
                      from={{ x: fromNode.x + 28, y: fromNode.y }}
                      to={{ x: toNode.x - 28, y: toNode.y }}
                      stroke="#bbf7d0"
                    />
                  ))
                )}

                {INPUTS.map((node) => (
                  <NeuronNode
                    key={`input-${node.label}`}
                    x={node.x}
                    y={node.y}
                    r={28}
                    fill="#eff6ff"
                    stroke="#3b82f6"
                    textColor="#1d4ed8"
                    label={node.label}
                  />
                ))}

                {HIDDEN1.map((node) => (
                  <NeuronNode
                    key={`hidden1-${node.label}`}
                    x={node.x}
                    y={node.y}
                    r={28}
                    fill="#f5f3ff"
                    stroke="#7c3aed"
                    textColor="#6d28d9"
                    label={node.label}
                    ring
                  />
                ))}

                {showH2 && HIDDEN2.map((node, index) => (
                  <motion.g
                    key={`hidden2-${node.label}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <NeuronNode
                      x={node.x}
                      y={node.y}
                      r={28}
                      fill="#faf5ff"
                      stroke="#a855f7"
                      textColor="#7e22ce"
                      label={node.label}
                      ring
                    />
                  </motion.g>
                ))}

                {showOut && outputs.map((node, index) => (
                  <motion.g key={`output-${node.label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}>
                    <NeuronNode
                      x={node.x}
                      y={node.y}
                      r={28}
                      fill="#f0fdf4"
                      stroke="#059669"
                      textColor="#047857"
                      label={node.label}
                    />
                  </motion.g>
                ))}

                <path
                  d={`M ${outputs[outputs.length - 1].x + 30} 210 C ${outputs[outputs.length - 1].x + 72} 210, ${outputs[outputs.length - 1].x + 92} 210, ${outputs[outputs.length - 1].x + 128} 210`}
                  fill="none"
                  stroke="#86efac"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                  opacity={showOut ? 1 : 0}
                />

                <text x="430" y="388" textAnchor="middle" fontSize="13" fill="#64748b">
                  Signals flow left to right as each layer transforms the pattern.
                </text>
              </motion.g>
            )}
          </svg>
        </div>

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

      </div>
    </section>
  )
}
