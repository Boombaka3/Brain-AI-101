import { useMemo, useState } from 'react'
import DeepLearningBridge from './DeepLearningBridge'

const INPUT_NODES = [
  { id: 'i1', x: 110, y: 90, label: 'x1' },
  { id: 'i2', x: 110, y: 180, label: 'x2' },
  { id: 'i3', x: 110, y: 270, label: 'x3' },
]

const HIDDEN_NODES = [
  { id: 'h1', x: 360, y: 120, label: 'h1' },
  { id: 'h2', x: 360, y: 240, label: 'h2' },
]

const OUTPUT_NODE = { id: 'o1', x: 620, y: 180, label: 'y' }

const CONNECTIONS = [
  { id: 'i1h1', from: 'i1', to: 'h1', x1: 110, y1: 90, x2: 360, y2: 120, labelX: 220, labelY: 92, path: 'M 110 90 C 190 90, 250 110, 360 120' },
  { id: 'i1h2', from: 'i1', to: 'h2', x1: 110, y1: 90, x2: 360, y2: 240, labelX: 220, labelY: 152, path: 'M 110 90 C 190 90, 250 160, 360 240' },
  { id: 'i2h1', from: 'i2', to: 'h1', x1: 110, y1: 180, x2: 360, y2: 120, labelX: 220, labelY: 142, path: 'M 110 180 C 190 180, 250 150, 360 120' },
  { id: 'i2h2', from: 'i2', to: 'h2', x1: 110, y1: 180, x2: 360, y2: 240, labelX: 220, labelY: 202, path: 'M 110 180 C 190 180, 250 210, 360 240' },
  { id: 'i3h1', from: 'i3', to: 'h1', x1: 110, y1: 270, x2: 360, y2: 120, labelX: 220, labelY: 222, path: 'M 110 270 C 190 270, 250 180, 360 120' },
  { id: 'i3h2', from: 'i3', to: 'h2', x1: 110, y1: 270, x2: 360, y2: 240, labelX: 220, labelY: 270, path: 'M 110 270 C 190 270, 250 230, 360 240' },
  { id: 'h1o1', from: 'h1', to: 'o1', x1: 360, y1: 120, x2: 620, y2: 180, labelX: 495, labelY: 132, path: 'M 360 120 C 450 120, 530 145, 620 180' },
  { id: 'h2o1', from: 'h2', to: 'o1', x1: 360, y1: 240, x2: 620, y2: 180, labelX: 495, labelY: 226, path: 'M 360 240 C 450 240, 530 215, 620 180' },
]

const FORWARD_FLOW = ['i1h1', 'i2h1', 'i3h1', 'i1h2', 'i2h2', 'i3h2', 'h1o1', 'h2o1']
const BACKWARD_FLOW = ['h1o1', 'h2o1', 'i1h1', 'i2h1', 'i3h1', 'i1h2', 'i2h2', 'i3h2']

const START_WEIGHTS = {
  i1h1: 0.4,
  i1h2: 0.2,
  i2h1: 0.3,
  i2h2: 0.5,
  i3h1: 0.6,
  i3h2: 0.4,
  h1o1: 0.7,
  h2o1: 0.5,
}

const UPDATED_WEIGHTS = {
  i1h1: 0.5,
  i1h2: 0.3,
  i2h1: 0.3,
  i2h2: 0.5,
  i3h1: 0.7,
  i3h2: 0.5,
  h1o1: 0.8,
  h2o1: 0.6,
}

const CHANGED_CONNECTIONS = CONNECTIONS.filter((connection) => START_WEIGHTS[connection.id] !== UPDATED_WEIGHTS[connection.id]).map((connection) => connection.id)

function BackpropagationSection() {
  const [forwardRun, setForwardRun] = useState(0)
  const [errorShown, setErrorShown] = useState(false)
  const [backwardRun, setBackwardRun] = useState(0)
  const [weightsUpdated, setWeightsUpdated] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [flowRun, setFlowRun] = useState(0)

  const weights = weightsUpdated ? UPDATED_WEIGHTS : START_WEIGHTS
  const prediction = weightsUpdated ? '0.9' : forwardRun > 0 ? '0.6' : '--'
  const target = errorShown ? '1.0' : '--'
  const error = errorShown ? (weightsUpdated ? '0.1' : '0.4') : '--'

  const flowIds = phase === 'backward' ? BACKWARD_FLOW : FORWARD_FLOW

  const activeNodes = useMemo(() => {
    if (phase === 'forward') return new Set(['i1', 'i2', 'i3', 'h1', 'h2', 'o1'])
    if (phase === 'error') return new Set(['o1'])
    if (phase === 'backward') return new Set(['o1', 'h1', 'h2', 'i1', 'i2', 'i3'])
    if (phase === 'update') return new Set(['h1', 'h2', 'o1'])
    if (weightsUpdated) return new Set(['h1', 'h2', 'o1'])
    return new Set()
  }, [phase, weightsUpdated])

  const handleForward = () => {
    setForwardRun((value) => value + 1)
    setErrorShown(false)
    setBackwardRun(0)
    setWeightsUpdated(false)
    setPhase('forward')
    setFlowRun((value) => value + 1)
  }

  const handleShowError = () => {
    setErrorShown(true)
    setPhase('error')
  }

  const handleBackward = () => {
    setBackwardRun((value) => value + 1)
    setPhase('backward')
    setFlowRun((value) => value + 1)
  }

  const handleUpdateWeights = () => {
    setWeightsUpdated(true)
    setPhase('update')
    setFlowRun((value) => value + 1)
  }

  const reset = () => {
    setForwardRun(0)
    setErrorShown(false)
    setBackwardRun(0)
    setWeightsUpdated(false)
    setPhase('idle')
    setFlowRun(0)
  }

  const connectionStroke = (value) => 2 + value * 4
  const networkClassName = [
    'm3-backprop-network-board',
    phase === 'forward' ? 'is-forward' : '',
    phase === 'backward' ? 'is-backward' : '',
    phase === 'update' ? 'is-update' : '',
    phase === 'error' ? 'is-error' : '',
  ].filter(Boolean).join(' ')

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">D. BACKPROPAGATION</p>
        <h2>Backpropagation: Sending Error Backward</h2>
        <p className="m3-section-subtitle">
          The model uses error to decide which connections should change.
        </p>
      </div>

      <div className="m3-section-card m3-backprop-card">
        <DeepLearningBridge compact />

        <div className="m3-backprop-topline">
          <div className={`m3-backprop-direction m3-backprop-direction--panel${phase === 'forward' ? ' is-active' : ''}`}>
            <div className="m3-backprop-direction__header">
              <span className={`m3-backprop-badge${phase === 'forward' ? ' is-active' : ''}`}>Forward pass</span>
              <span>Inputs -&gt; Hidden layer -&gt; Output -&gt; Prediction</span>
            </div>
            <svg viewBox="0 0 320 42" className="m3-backprop-direction__viz" aria-hidden="true">
              <path d="M 24 21 C 72 21, 88 21, 132 21" className="m3-passline m3-passline--base" />
              <path d="M 132 21 C 176 21, 196 21, 240 21" className="m3-passline m3-passline--base" />
              <path d="M 240 21 C 264 21, 278 21, 296 21" className="m3-passline m3-passline--base" />
              <path d="M 24 21 C 72 21, 88 21, 132 21" className={`m3-passline m3-passline--forward${phase === 'forward' ? ' is-active' : ''}`} />
              <path d="M 132 21 C 176 21, 196 21, 240 21" className={`m3-passline m3-passline--forward${phase === 'forward' ? ' is-active' : ''}`} />
              <path d="M 240 21 C 264 21, 278 21, 296 21" className={`m3-passline m3-passline--forward${phase === 'forward' ? ' is-active' : ''}`} />
              <circle cx="24" cy="21" r="5" className="m3-passnode m3-passnode--input" />
              <circle cx="132" cy="21" r="5" className="m3-passnode m3-passnode--hidden" />
              <circle cx="240" cy="21" r="5" className="m3-passnode m3-passnode--hidden" />
              <circle cx="296" cy="21" r="6" className="m3-passnode m3-passnode--output" />
              {phase === 'forward' ? (
                <>
                  <path id={`m3-forward-pass-1-${flowRun}`} d="M 24 21 C 72 21, 88 21, 132 21" fill="none" stroke="none" />
                  <path id={`m3-forward-pass-2-${flowRun}`} d="M 132 21 C 176 21, 196 21, 240 21" fill="none" stroke="none" />
                  <path id={`m3-forward-pass-3-${flowRun}`} d="M 240 21 C 264 21, 278 21, 296 21" fill="none" stroke="none" />
                  {[1, 2, 3].map((step) => (
                    <circle key={`forward-chip-${step}`} r="4" className="m3-passchip m3-passchip--forward">
                      <animateMotion dur="0.55s" begin={`${(step - 1) * 0.2}s`} fill="freeze">
                        <mpath href={`#m3-forward-pass-${step}-${flowRun}`} />
                      </animateMotion>
                    </circle>
                  ))}
                </>
              ) : null}
            </svg>
          </div>
          <div className={`m3-backprop-direction m3-backprop-direction--panel${phase === 'backward' || phase === 'error' || phase === 'update' ? ' is-active' : ''}`}>
            <div className="m3-backprop-direction__header">
              <span className={`m3-backprop-badge m3-backprop-badge--error${phase === 'backward' || phase === 'error' || phase === 'update' ? ' is-active' : ''}`}>Backward pass</span>
              <span>Error -&gt; Output layer -&gt; Hidden layer -&gt; Weight updates</span>
            </div>
            <svg viewBox="0 0 320 42" className="m3-backprop-direction__viz" aria-hidden="true">
              <path d="M 296 21 C 264 21, 278 21, 240 21" className="m3-passline m3-passline--base" />
              <path d="M 240 21 C 196 21, 176 21, 132 21" className="m3-passline m3-passline--base" />
              <path d="M 132 21 C 88 21, 72 21, 24 21" className="m3-passline m3-passline--base" />
              <path d="M 296 21 C 264 21, 278 21, 240 21" className={`m3-passline m3-passline--backward${phase === 'backward' ? ' is-active' : ''}`} />
              <path d="M 240 21 C 196 21, 176 21, 132 21" className={`m3-passline m3-passline--backward${phase === 'backward' ? ' is-active' : ''}`} />
              <path d="M 132 21 C 88 21, 72 21, 24 21" className={`m3-passline m3-passline--backward${phase === 'backward' ? ' is-active' : ''}`} />
              <circle cx="24" cy="21" r="5" className="m3-passnode m3-passnode--input" />
              <circle cx="132" cy="21" r="5" className="m3-passnode m3-passnode--hidden" />
              <circle cx="240" cy="21" r="5" className="m3-passnode m3-passnode--hidden" />
              <circle cx="296" cy="21" r="6" className="m3-passnode m3-passnode--output m3-passnode--error" />
              {(phase === 'backward' || phase === 'error') ? (
                <>
                  <path id={`m3-backward-pass-1-${flowRun}`} d="M 296 21 C 264 21, 278 21, 240 21" fill="none" stroke="none" />
                  <path id={`m3-backward-pass-2-${flowRun}`} d="M 240 21 C 196 21, 176 21, 132 21" fill="none" stroke="none" />
                  <path id={`m3-backward-pass-3-${flowRun}`} d="M 132 21 C 88 21, 72 21, 24 21" fill="none" stroke="none" />
                  {[1, 2, 3].map((step) => (
                    <circle key={`backward-chip-${step}`} r="4" className="m3-passchip m3-passchip--backward">
                      <animateMotion dur="0.55s" begin={`${(step - 1) * 0.2}s`} fill="freeze">
                        <mpath href={`#m3-backward-pass-${step}-${flowRun}`} />
                      </animateMotion>
                    </circle>
                  ))}
                </>
              ) : null}
            </svg>
          </div>
        </div>

        <div className="m3-backprop-layout">
          <div className="m3-backprop-network">
            <svg viewBox="0 0 720 360" className={`m3-svg-block ${networkClassName}`} aria-label="Simple neural network for backpropagation">
              <defs>
                <filter id="m3BackpropGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect x="20" y="20" width="680" height="320" rx="18" fill="#f8fafc" stroke="#e2e8f0" />

              <text x="85" y="54" textAnchor="middle" fontSize="12" fill="#64748b">Input</text>
              <text x="360" y="54" textAnchor="middle" fontSize="12" fill="#64748b">Hidden</text>
              <text x="620" y="54" textAnchor="middle" fontSize="12" fill="#64748b">Output</text>

              <g className={`m3-backprop-links m3-backprop-links--base${phase !== 'idle' ? ` is-${phase}` : ''}`}>
                {CONNECTIONS.map((connection) => (
                  <path
                    key={connection.id}
                    d={connection.path}
                    fill="none"
                    stroke={connection.from.startsWith('h') ? '#64748b' : '#94a3b8'}
                    strokeWidth={connectionStroke(weights[connection.id])}
                    strokeLinecap="round"
                  />
                ))}
              </g>

              <g className="m3-backprop-links m3-backprop-links--overlay">
                {CONNECTIONS.map((connection) => {
                  const isForward = phase === 'forward'
                  const isBackward = phase === 'backward'
                  const isUpdate = phase === 'update' && CHANGED_CONNECTIONS.includes(connection.id)
                  const overlayClassName = [
                    'm3-backprop-connection',
                    isForward ? 'is-forward' : '',
                    isBackward ? 'is-backward' : '',
                    isUpdate ? 'is-update' : '',
                  ].filter(Boolean).join(' ')

                  return (
                    <path
                      key={connection.id}
                      d={connection.path}
                      className={overlayClassName}
                      fill="none"
                      strokeWidth={connectionStroke(weights[connection.id]) + 0.8}
                      strokeLinecap="round"
                    />
                  )
                })}
              </g>

              {CONNECTIONS.map((connection) => {
                const before = START_WEIGHTS[connection.id]
                const after = UPDATED_WEIGHTS[connection.id]
                const changed = before !== after

                return (
                  <g key={`${connection.id}-label`} className={`m3-backprop-weight${changed && weightsUpdated ? ' is-updated' : ''}`}>
                    <text
                      x={connection.labelX}
                      y={connection.labelY}
                      fontSize="11"
                      fill={changed && weightsUpdated ? '#047857' : '#475569'}
                      fontWeight="700"
                    >
                      {weights[connection.id].toFixed(1)}
                    </text>
                    {changed && weightsUpdated ? (
                      <text x={connection.labelX + 18} y={connection.labelY - 10} fontSize="10" fill="#059669" fontWeight="700">
                        +{(after - before).toFixed(1)}
                      </text>
                    ) : null}
                  </g>
                )
              })}

              {[...INPUT_NODES, ...HIDDEN_NODES, OUTPUT_NODE].map((node) => {
                const isActive = activeNodes.has(node.id)
                const isOutput = node.id === 'o1'
                const nodeClassName = [
                  'm3-backprop-node',
                  isActive ? 'is-active' : '',
                  phase === 'error' && isOutput ? 'is-error' : '',
                  phase === 'update' && (node.id === 'h1' || node.id === 'h2' || node.id === 'o1') ? 'is-update' : '',
                ].filter(Boolean).join(' ')

                return (
                  <g key={node.id} className={nodeClassName}>
                    <circle
                      className="m3-backprop-node__halo"
                      cx={node.x}
                      cy={node.y}
                      r={node.id === 'o1' ? 34 : 29}
                      fill={phase === 'error' && isOutput ? 'rgba(239, 68, 68, 0.16)' : 'rgba(59, 130, 246, 0.12)'}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.id === 'o1' ? 28 : 24}
                      fill="#ffffff"
                      stroke={isOutput ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="3"
                    />
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
                      {node.label}
                    </text>
                  </g>
                )
              })}

              {errorShown ? (
                <g className={`m3-backprop-error-chip${phase === 'error' || phase === 'backward' ? ' is-visible' : ''}`}>
                  <rect x="572" y="88" width="96" height="34" rx="17" fill="#fff1f2" stroke="#fda4af" />
                  <text x="620" y="110" textAnchor="middle" fontSize="12" fontWeight="700" fill="#be123c">
                    Error {error}
                  </text>
                </g>
              ) : null}

              {(phase === 'forward' || phase === 'backward') ? (
                <g key={`${phase}-${flowRun}`} filter="url(#m3BackpropGlow)">
                  {flowIds.map((connectionId, index) => {
                    const connection = CONNECTIONS.find((item) => item.id === connectionId)
                    const particleClassName = phase === 'backward' ? 'm3-backprop-particle is-backward' : 'm3-backprop-particle is-forward'
                    const motionPath = phase === 'backward'
                      ? `M ${connection.x2} ${connection.y2} C ${(connection.x2 + connection.x1) / 2 + 50} ${connection.y2}, ${(connection.x2 + connection.x1) / 2 - 50} ${connection.y1}, ${connection.x1} ${connection.y1}`
                      : connection.path

                    return (
                      <g key={`${connection.id}-${flowRun}`}>
                        <path id={`bp-flow-${phase}-${connection.id}-${flowRun}`} d={motionPath} fill="none" stroke="none" />
                        <circle className={particleClassName} r="5.5">
                          <animateMotion dur="1.1s" begin={`${index * 0.12}s`} fill="freeze">
                            <mpath href={`#bp-flow-${phase}-${connection.id}-${flowRun}`} />
                          </animateMotion>
                        </circle>
                      </g>
                    )
                  })}
                </g>
              ) : null}
            </svg>
          </div>

          <div className="m3-backprop-sidebar">
            <div className="m3-backprop-stats">
              <div className={`m3-backprop-stat${phase === 'forward' || weightsUpdated ? ' is-active' : ''}`}>
                <span>Prediction</span>
                <strong>{prediction}</strong>
              </div>
              <div className={`m3-backprop-stat${phase === 'error' || phase === 'backward' || phase === 'update' ? ' is-active' : ''}`}>
                <span>Target</span>
                <strong>{target}</strong>
              </div>
              <div className={`m3-backprop-stat${phase === 'error' || phase === 'backward' || phase === 'update' ? ' is-active m3-backprop-stat--danger' : ''}`}>
                <span>Error</span>
                <strong>{error}</strong>
              </div>
            </div>

            <div className="m3-backprop-explainer">
              <p className="m3-backprop-label">Explanation</p>
              <p>
                Backpropagation does not mean the AI "thinks backward." It means the model calculates how much each connection contributed to the error, then adjusts the weights.
              </p>
            </div>

            <div className="m3-backprop-analogy">
              <p className="m3-backprop-label">Student analogy</p>
              <p>
                Imagine a group project receives a low score. The team looks backward through the project to find which parts caused the problem. Then each person improves their part for next time.
              </p>
            </div>

            <div className="m3-backprop-note">
              <p className="m3-backprop-label">Accuracy note</p>
              <p>
                This is a simplified model. Real backpropagation uses calculus, but the basic idea is error-guided weight adjustment.
              </p>
            </div>
          </div>
        </div>

        <div className="m3-controls">
          <button className="m3-btn" onClick={handleForward}>
            Run Forward Pass
          </button>
          <button className="m3-btn" onClick={handleShowError} disabled={forwardRun === 0}>
            Show Error
          </button>
          <button className="m3-btn" onClick={handleBackward} disabled={!errorShown}>
            Send Error Backward
          </button>
          <button className="m3-btn" onClick={handleUpdateWeights} disabled={backwardRun === 0}>
            Update Weights
          </button>
          <button className="m3-btn" onClick={reset}>
            Reset
          </button>
        </div>

        <p className="m3-takeaway">
          Backpropagation helps a model learn by tracing the error backward and updating weights.
        </p>
      </div>
    </section>
  )
}

export default BackpropagationSection
