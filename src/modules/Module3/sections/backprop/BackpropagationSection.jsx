import { useMemo, useState } from 'react'

const INPUT_NODES = [
  { id: 'i1', x: 110, y: 92, label: 'x1' },
  { id: 'i2', x: 110, y: 180, label: 'x2' },
  { id: 'i3', x: 110, y: 268, label: 'x3' },
]

const HIDDEN_NODES = [
  { id: 'h1', x: 360, y: 122, label: 'h1' },
  { id: 'h2', x: 360, y: 238, label: 'h2' },
]

const OUTPUT_NODE = { id: 'o1', x: 620, y: 180, label: 'y' }
const NETWORK_FRAME = { x: 20, y: 20, width: 680, height: 320 }
const ERROR_CHIP = {
  width: 128,
  height: 40,
  radius: 20,
  inset: 18,
  gap: 20,
  topInset: 26,
}

const CONNECTIONS = [
  {
    id: 'i1h1',
    from: 'i1',
    to: 'h1',
    path: 'M 110 92 C 190 92, 250 112, 360 122',
    chipX: 198,
    chipY: 72,
  },
  {
    id: 'i1h2',
    from: 'i1',
    to: 'h2',
    path: 'M 110 92 C 192 92, 256 162, 360 238',
    chipX: 250,
    chipY: 136,
  },
  {
    id: 'i2h1',
    from: 'i2',
    to: 'h1',
    path: 'M 110 180 C 188 180, 254 150, 360 122',
    chipX: 194,
    chipY: 142,
  },
  {
    id: 'i2h2',
    from: 'i2',
    to: 'h2',
    path: 'M 110 180 C 188 180, 254 208, 360 238',
    chipX: 194,
    chipY: 214,
  },
  {
    id: 'i3h1',
    from: 'i3',
    to: 'h1',
    path: 'M 110 268 C 190 268, 252 184, 360 122',
    chipX: 248,
    chipY: 232,
  },
  {
    id: 'i3h2',
    from: 'i3',
    to: 'h2',
    path: 'M 110 268 C 188 268, 252 236, 360 238',
    chipX: 206,
    chipY: 288,
  },
  {
    id: 'h1o1',
    from: 'h1',
    to: 'o1',
    path: 'M 360 122 C 448 122, 530 146, 620 180',
    chipX: 492,
    chipY: 124,
  },
  {
    id: 'h2o1',
    from: 'h2',
    to: 'o1',
    path: 'M 360 238 C 448 238, 530 214, 620 180',
    chipX: 492,
    chipY: 236,
  },
]

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

const PHASE_COPY = {
  idle: 'The model has a set of weights. A new input arrives. Which weights will matter?',
  forward: 'Signal flows forward through every connection. Each weight shapes the output. Prediction: 0.6.',
  error: 'Target was 1.0. Prediction was 0.6. Error = 0.4. Now the question is: which weight caused this?',
  backward: 'The error travels backward through every connection. Weights closer to the mistake receive more blame.',
  update: 'Each blamed weight shifts by a small amount. Same input now produces 0.9. The blame was traced correctly.',
}

const PARTICLE_GROUPS = {
  forward: [
    { id: 'forward-a', path: 'M 110 92 C 190 92, 250 112, 360 122 C 448 122, 530 146, 620 180', delay: '0s' },
    { id: 'forward-b', path: 'M 110 180 C 188 180, 254 208, 360 238 C 448 238, 530 214, 620 180', delay: '0.22s' },
    { id: 'forward-c', path: 'M 110 268 C 190 268, 252 184, 360 122 C 448 122, 530 146, 620 180', delay: '0.44s' },
  ],
  backward: [
    { id: 'backward-a', path: 'M 620 180 C 530 146, 448 122, 360 122 C 250 112, 190 92, 110 92', delay: '0s' },
    { id: 'backward-b', path: 'M 620 180 C 530 214, 448 238, 360 238 C 254 208, 188 180, 110 180', delay: '0.22s' },
    { id: 'backward-c', path: 'M 620 180 C 530 214, 448 238, 360 238 C 252 236, 188 268, 110 268', delay: '0.44s' },
  ],
}

const CHANGED_CONNECTIONS = CONNECTIONS.filter((connection) => START_WEIGHTS[connection.id] !== UPDATED_WEIGHTS[connection.id]).map((connection) => connection.id)

const DETAIL_WEIGHTS = [
  { id: 'h1o1', label: 'Hidden 1 -> Prediction' },
  { id: 'h2o1', label: 'Hidden 2 -> Prediction' },
  { id: 'i1h1', label: 'Input 1 -> Hidden 1' },
  { id: 'i3h1', label: 'Input 3 -> Hidden 1' },
]

const STEPS = [
  {
    id: 'forward',
    index: 0,
    label: 'Predict',
    sublabel: 'Signal flows forward',
    handler: 'handleForward',
  },
  {
    id: 'error',
    index: 1,
    label: 'Measure Error',
    sublabel: 'Measure the mistake',
    handler: 'handleShowError',
  },
  {
    id: 'backward',
    index: 2,
    label: 'Trace Back',
    sublabel: 'Trace which weights caused it',
    handler: 'handleBackward',
  },
  {
    id: 'update',
    index: 3,
    label: 'Adjust',
    sublabel: 'Shift the blamed weights',
    handler: 'handleUpdateWeights',
  },
]

const PHASE_ORDER = ['idle', 'forward', 'error', 'backward', 'update']

function BackpropagationSection() {
  const [forwardRun, setForwardRun] = useState(0)
  const [errorShown, setErrorShown] = useState(false)
  const [backwardRun, setBackwardRun] = useState(0)
  const [weightsUpdated, setWeightsUpdated] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [flowRun, setFlowRun] = useState(0)
  const [visitedPhases, setVisitedPhases] = useState(new Set(['idle']))

  const weights = weightsUpdated ? UPDATED_WEIGHTS : START_WEIGHTS
  const prediction = weightsUpdated ? '0.9' : forwardRun > 0 ? '0.6' : '--'
  const target = errorShown ? '1.0' : '--'
  const error = errorShown ? (weightsUpdated ? '0.1' : '0.4') : '--'
  const activeConnections = phase === 'update'
    ? new Set(CHANGED_CONNECTIONS)
    : phase === 'forward' || phase === 'backward'
      ? new Set(CONNECTIONS.map((connection) => connection.id))
      : new Set()

  const activeNodes = useMemo(() => {
    if (phase === 'forward') return new Set(['i1', 'i2', 'i3', 'h1', 'h2', 'o1'])
    if (phase === 'error') return new Set(['o1'])
    if (phase === 'backward') return new Set(['o1', 'h1', 'h2'])
    if (phase === 'update') return new Set(['h1', 'h2', 'o1'])
    if (weightsUpdated) return new Set(['h1', 'h2', 'o1'])
    return new Set()
  }, [phase, weightsUpdated])

  const handleForward = () => {
    setForwardRun((v) => v + 1)
    setErrorShown(false)
    setBackwardRun(0)
    setWeightsUpdated(false)
    setPhase('forward')
    setFlowRun((v) => v + 1)
    setVisitedPhases(new Set(['idle', 'forward']))
  }

  const handleShowError = () => {
    setErrorShown(true)
    setPhase('error')
    setVisitedPhases((prev) => new Set([...prev, 'error']))
  }

  const handleBackward = () => {
    setBackwardRun((v) => v + 1)
    setPhase('backward')
    setFlowRun((v) => v + 1)
    setVisitedPhases((prev) => new Set([...prev, 'backward']))
  }

  const handleUpdateWeights = () => {
    setWeightsUpdated(true)
    setPhase('update')
    setFlowRun((v) => v + 1)
    setVisitedPhases((prev) => new Set([...prev, 'update']))
  }

  const reset = () => {
    setForwardRun(0)
    setErrorShown(false)
    setBackwardRun(0)
    setWeightsUpdated(false)
    setPhase('idle')
    setFlowRun(0)
    setVisitedPhases(new Set(['idle']))
  }

  const connectionStroke = (value) => 2 + value * 4
  const phaseClassName = phase !== 'idle' ? `is-${phase}` : ''

  const currentPhaseIndex = PHASE_ORDER.indexOf(phase)

  const HANDLER_MAP = {
    handleForward,
    handleShowError,
    handleBackward,
    handleUpdateWeights,
  }

  const nextStep = STEPS.find((s) => s.index === currentPhaseIndex)
    || STEPS[STEPS.length - 1]

  const isComplete = phase === 'update'

  const errorChipX = Math.min(
    NETWORK_FRAME.x + NETWORK_FRAME.width - ERROR_CHIP.width - ERROR_CHIP.inset,
    Math.max(NETWORK_FRAME.x + ERROR_CHIP.inset, OUTPUT_NODE.x - ERROR_CHIP.width - ERROR_CHIP.gap),
  )
  const errorChipY = Math.max(NETWORK_FRAME.y + ERROR_CHIP.topInset, OUTPUT_NODE.y - 96)
  const errorChipPointerEndX = OUTPUT_NODE.x - 18
  const errorChipPointerEndY = OUTPUT_NODE.y - 26

  return (
    <section className="m3-section">
      <div className="m3-section-card m3-section-card--feature m3-backprop-card">
        <div className="m3-section-heading">
          <p className="m3-eyebrow">D. BACKPROPAGATION</p>
          <h2>Which Weight Gets the Blame?</h2>
          <p className="m3-section-subtitle">
            When the model is wrong, not every weight caused the mistake equally.
            Backpropagation traces the error backward to find which connections
            need to change — and by how much.
          </p>
        </div>

        <div className="m3-backprop-layout">
          <div className="m3-backprop-network">
            <div className="m3-backprop-phase-card">
              <p className="m3-backprop-label">Current step</p>
              <h3>
                {phase === 'idle'
                  ? 'Ready to start'
                  : STEPS.find((s) => s.id === phase)?.label ?? phase}
              </h3>
              <p>{PHASE_COPY[phase]}</p>
              {phase !== 'idle' && (
                <div className="m3-backprop-phase-history">
                  {STEPS.filter((s) => visitedPhases.has(s.id) && s.id !== phase).map((s) => (
                    <div key={s.id} className="m3-backprop-phase-history__item">
                      <span className="m3-backprop-phase-history__check">✓</span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            <svg viewBox="0 0 720 360" className={`m3-svg-block m3-backprop-network-board ${phaseClassName}`} aria-label="Simple neural network for backpropagation">
              <defs>
                <filter id="m3BackpropParticleGlow" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="7" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect x="20" y="20" width="680" height="320" rx="22" fill="#f8fafc" stroke="#e2e8f0" />

              <text x="110" y="56" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">Input Features</text>
              <text x="360" y="56" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">Middle Layer</text>
              <text x="620" y="56" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">Prediction</text>

              <g className={`m3-backprop-links m3-backprop-links--base ${phaseClassName}`.trim()}>
                {CONNECTIONS.map((connection) => {
                  const isActive = activeConnections.has(connection.id)

                  return (
                    <path
                      key={connection.id}
                      d={connection.path}
                      className={`m3-backprop-base-path${isActive ? ' is-active' : ''}`}
                      fill="none"
                      strokeWidth={connectionStroke(weights[connection.id])}
                      strokeLinecap="round"
                    />
                  )
                })}
              </g>

              <g className="m3-backprop-links m3-backprop-links--overlay">
                {CONNECTIONS.map((connection) => {
                  const isForward = phase === 'forward' && activeConnections.has(connection.id)
                  const isBackward = phase === 'backward' && activeConnections.has(connection.id)
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
                      strokeWidth={connectionStroke(weights[connection.id]) + 1.6}
                      strokeLinecap="round"
                    />
                  )
                })}
              </g>

              {CONNECTIONS.map((connection) => {
                const before = START_WEIGHTS[connection.id]
                const after = UPDATED_WEIGHTS[connection.id]
                const changed = before !== after
                const chipClassName = [
                  'm3-backprop-weight-chip',
                  activeConnections.has(connection.id) ? 'is-active' : '',
                  changed && weightsUpdated ? 'is-updated' : '',
                ].filter(Boolean).join(' ')

                return (
                  <g key={`${connection.id}-chip`} className={chipClassName} transform={`translate(${connection.chipX}, ${connection.chipY})`}>
                    <rect x="-24" y="-13" width="48" height="26" rx="13" />
                    <text x="0" y="4" textAnchor="middle">
                      {weights[connection.id].toFixed(1)}
                    </text>
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
                    <circle className="m3-backprop-node__halo" cx={node.x} cy={node.y} r={node.id === 'o1' ? 36 : 31} />
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
                <g
                  className={`m3-backprop-error-chip${phase === 'error' || phase === 'backward' || phase === 'update' ? ' is-visible' : ''}`}
                  transform={`translate(${errorChipX}, ${errorChipY})`}
                >
                  <path
                    className="m3-backprop-error-chip__pointer"
                    d={`M ${ERROR_CHIP.width - 2} ${ERROR_CHIP.height * 0.58} C ${ERROR_CHIP.width + 12} ${ERROR_CHIP.height * 0.52}, ${errorChipPointerEndX - errorChipX - 28} ${errorChipPointerEndY - errorChipY + 6}, ${errorChipPointerEndX - errorChipX} ${errorChipPointerEndY - errorChipY}`}
                  />
                  <rect x="0" y="0" width={ERROR_CHIP.width} height={ERROR_CHIP.height} rx={ERROR_CHIP.radius} />
                  <text x={ERROR_CHIP.width / 2} y="25" textAnchor="middle">Error {error}</text>
                </g>
              ) : null}

              {phase === 'forward' || phase === 'backward' ? (
                <g key={`${phase}-${flowRun}`} filter="url(#m3BackpropParticleGlow)">
                  {PARTICLE_GROUPS[phase].map((particle) => (
                    <g key={`${particle.id}-${flowRun}`}>
                      <path id={`bp-particle-${particle.id}-${flowRun}`} d={particle.path} fill="none" stroke="none" />
                      <circle className={`m3-backprop-particle-trail is-${phase}`} r="8.5">
                        <animateMotion dur="1.35s" begin={particle.delay} fill="freeze">
                          <mpath href={`#bp-particle-${particle.id}-${flowRun}`} />
                        </animateMotion>
                      </circle>
                      <circle className={`m3-backprop-particle-core is-${phase}`} r="5.5">
                        <animateMotion dur="1.35s" begin={particle.delay} fill="freeze">
                          <mpath href={`#bp-particle-${particle.id}-${flowRun}`} />
                        </animateMotion>
                      </circle>
                    </g>
                  ))}
                </g>
              ) : null}
            </svg>

            {(phase === 'backward' || phase === 'update') && (
              <div className="m3-backprop-weight-panel m3-backprop-weight-panel--network">
                <div className="m3-backprop-weight-panel__header">
                  <p className="m3-backprop-label">
                    {phase === 'update' ? 'Weights updated' : 'Connections that will change'}
                  </p>
                </div>
                <div className="m3-backprop-weight-panel__list">
                  {DETAIL_WEIGHTS.map((item) => {
                    const before = START_WEIGHTS[item.id]
                    const after = UPDATED_WEIGHTS[item.id]
                    const changed = before !== after

                    return (
                      <div key={item.id} className={`m3-backprop-weight-row${changed ? ' is-change' : ''}${weightsUpdated && changed ? ' is-updated' : ''}`}>
                        <span>{item.label}</span>
                        <strong>{before.toFixed(1)} -&gt; {after.toFixed(1)}</strong>
                        {weightsUpdated && changed
                          ? <em className="is-updated-tag">↑ +{(after - before).toFixed(1)}</em>
                          : changed
                            ? <em className="is-change-tag">Will change</em>
                            : <em className="is-nochange-tag">No change</em>
                        }
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="m3-backprop-sidebar">
            <div className="m3-backprop-explainer">
              <p className="m3-backprop-label">Explanation</p>
              <p>
                Backpropagation means using a mistake to decide what to change.
              </p>
              <p>
                The model makes a prediction, compares it with the target, sends the error backward through the network, and updates the connections that influenced the mistake.
              </p>
              <p>
                The goal is simple: change the model so the next prediction is better.
              </p>
            </div>

            <div className="m3-backprop-analogy">
              <p className="m3-backprop-label">Student analogy</p>
              <p>
                Imagine solving a multi-step math problem and getting the final answer wrong.
              </p>
              <p>
                You do not restart blindly. You look back through the steps, find where the reasoning went off track, and fix the parts that caused the mistake.
              </p>
              <p>
                Backpropagation works the same way: it traces the error backward and uses it to adjust the model.
              </p>
            </div>

            <div className="m3-backprop-note">
              <p className="m3-backprop-label">Accuracy note</p>
              <p>
                This diagram shows the core idea, not the full mathematics.
              </p>
              <p>
                Real systems use precise calculations to decide the size of each update, but the central idea stays the same: error tells the model what to change.
              </p>
            </div>
          </div>
        </div>

        <div className="m3-backprop-stepper">
          <div className="m3-backprop-stepper__track">
            {STEPS.map((step, i) => {
              const isActive = phase === step.id
              const isVisited = visitedPhases.has(step.id)
              const isReachable = isVisited || (
                step.id === 'forward' ||
                (step.id === 'error' && forwardRun > 0) ||
                (step.id === 'backward' && errorShown) ||
                (step.id === 'update' && backwardRun > 0)
              )
              return (
                <button
                  key={step.id}
                  className={[
                    'm3-stepper-step',
                    isActive ? 'is-active' : '',
                    isVisited ? 'is-visited' : '',
                    !isReachable ? 'is-locked' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => isReachable && HANDLER_MAP[step.handler]()}
                  disabled={!isReachable}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="m3-stepper-step__num">
                    {isVisited && !isActive ? '✓' : i + 1}
                  </span>
                  <span className="m3-stepper-step__label">{step.label}</span>
                  <span className="m3-stepper-step__sub">{step.sublabel}</span>
                </button>
              )
            })}
          </div>

          <div className="m3-backprop-stepper__actions">
            {!isComplete ? (
              <button
                className="m3-btn m3-btn--primary m3-stepper-advance"
                onClick={() => HANDLER_MAP[nextStep.handler]()}
                disabled={
                  (nextStep.id === 'error' && forwardRun === 0) ||
                  (nextStep.id === 'backward' && !errorShown) ||
                  (nextStep.id === 'update' && backwardRun === 0)
                }
              >
                {phase === 'idle'
                  ? 'Start — Make a Prediction'
                  : `Next — ${STEPS[(currentPhaseIndex)]?.label ?? 'Continue'}`
                }
              </button>
            ) : (
              <div className="m3-stepper-complete">
                All four steps complete — the model improved.
              </div>
            )}
            <button className="m3-btn m3-stepper-reset" onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        <p className="m3-takeaway">
          Backpropagation does not guess which weights to change.
          It calculates exactly how much each weight contributed to the mistake.
        </p>
      </div>
    </section>
  )
}

export default BackpropagationSection
