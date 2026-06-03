import { useState } from 'react'

const PHASES = [
  {
    id: 'idle',
    label: 'Ready',
    buttonLabel: 'Start — First Pass',
    description: 'The model has been trained. Weights are frozen. A new input arrives.',
    direction: null,
    confidence: 0,
    outputLabel: '?',
    outputColor: '#94a3b8',
  },
  {
    id: 'forward1',
    label: 'Pass 1 — Forward',
    buttonLabel: 'Next — Feedback Pass',
    description: 'The input moves forward through the network. The output is uncertain — the input is unclear.',
    direction: 'forward',
    confidence: 28,
    outputLabel: '~3?',
    outputColor: '#f59e0b',
  },
  {
    id: 'feedback',
    label: 'Pass 2 — Feedback',
    buttonLabel: 'Next — Refined Pass',
    description: 'Context from higher layers feeds back down. Lower layers adjust their interpretation. Weights do not change.',
    direction: 'backward',
    confidence: 58,
    outputLabel: '~8?',
    outputColor: '#f97316',
  },
  {
    id: 'forward2',
    label: 'Pass 3 — Refined',
    buttonLabel: 'See result',
    description: 'The refined input moves forward again. The same weights now produce a more confident answer.',
    direction: 'forward',
    confidence: 92,
    outputLabel: '8',
    outputColor: '#059669',
  },
  {
    id: 'complete',
    label: 'Complete',
    buttonLabel: null,
    description: 'The model reached a confident answer without changing any weights. Feedback during inference refines perception, not the model.',
    direction: null,
    confidence: 92,
    outputLabel: '8',
    outputColor: '#059669',
  },
]

const PHASE_ORDER = ['idle', 'forward1', 'feedback', 'forward2', 'complete']

const CONTRAST_ROWS = [
  {
    aspect: 'When it happens',
    backprop: 'During training',
    inference: 'During prediction',
  },
  {
    aspect: 'What changes',
    backprop: 'Weights (permanent)',
    inference: 'Activations (temporary)',
  },
  {
    aspect: 'Direction',
    backprop: 'Error flows backward once',
    inference: 'Context loops back to refine',
  },
  {
    aspect: 'Goal',
    backprop: 'Improve the model',
    inference: 'Improve this prediction',
  },
]

const EXAMPLES = [
  {
    icon: '👁️',
    title: 'Reading a blurry word',
    brain: 'Context fills in missing letters from surrounding words.',
    ai: 'Language model uses surrounding tokens to resolve ambiguity.',
  },
  {
    icon: '🌫️',
    title: 'Object in fog',
    brain: 'Prior knowledge completes a partly hidden shape.',
    ai: 'Object detector refines with scene context from higher layers.',
  },
  {
    icon: '🔄',
    title: 'Iterative reasoning',
    brain: 'You reconsider a first impression after more context.',
    ai: 'Chain-of-thought feeds partial output back to refine the answer.',
  },
]

function InferenceFeedbackSection() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [animRun, setAnimRun] = useState(0)

  const phase = PHASES[phaseIndex]
  const isComplete = phase.id === 'complete'

  const advance = () => {
    if (isComplete) return
    setPhaseIndex((i) => i + 1)
    setAnimRun((n) => n + 1)
  }

  const reset = () => {
    setPhaseIndex(0)
    setAnimRun(0)
  }

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">F. FEEDBACK DURING INFERENCE</p>
        <h2>How Context Refines a Prediction</h2>
        <p className="m3-section-subtitle">
          After training, weights are frozen. But the model can still improve a
          prediction by using context from higher layers to refine lower-layer
          interpretation — without changing anything permanently.
        </p>
        <p className="m3-module-callback">
          In Section D, feedback changed weights. Here, feedback changes activations.
          The weights stay fixed.
        </p>
      </div>

      <div className="m3-section-card m3-infer-card">

        {/* ── Contrast table ── */}
        <div className="m3-infer-contrast">
          <div className="m3-infer-contrast__header">
            <span />
            <span className="m3-infer-contrast__col-head m3-infer-contrast__col-head--back">
              Backpropagation
            </span>
            <span className="m3-infer-contrast__col-head m3-infer-contrast__col-head--infer">
              Inference feedback
            </span>
          </div>
          {CONTRAST_ROWS.map((row) => (
            <div key={row.aspect} className="m3-infer-contrast__row">
              <span className="m3-infer-contrast__aspect">{row.aspect}</span>
              <span className="m3-infer-contrast__cell m3-infer-contrast__cell--back">
                {row.backprop}
              </span>
              <span className="m3-infer-contrast__cell m3-infer-contrast__cell--infer">
                {row.inference}
              </span>
            </div>
          ))}
        </div>

        {/* ── Network animation ── */}
        <div className="m3-infer-demo">

          {/* Phase status */}
          <div className="m3-infer-demo__status">
            <p className="m3-backprop-label">{phase.label}</p>
            <p className="m3-infer-demo__desc">{phase.description}</p>
            {phase.id !== 'idle' && phase.id !== 'complete' && (
              <div className="m3-infer-demo__weight-note">
                Weights: <strong>frozen</strong> — no updates
              </div>
            )}
          </div>

          {/* SVG network */}
          <svg
            viewBox="0 0 560 200"
            className="m3-svg-block m3-infer-network"
            aria-label="Inference feedback network diagram"
          >
            <defs>
              <filter id="m3InferGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Layer labels */}
            <text x="80"  y="24" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">Input</text>
            <text x="280" y="24" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">Hidden</text>
            <text x="480" y="24" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">Output</text>

            {/* Base connection paths */}
            {[
              'M 80 70 C 160 70, 200 80, 280 80',
              'M 80 100 C 160 100, 200 80, 280 80',
              'M 80 130 C 160 130, 200 120, 280 120',
              'M 80 100 C 160 100, 200 120, 280 120',
              'M 280 80  C 370 80,  420 100, 480 100',
              'M 280 120 C 370 120, 420 100, 480 100',
            ].map((d, i) => (
              <path key={i} d={d} fill="none"
                stroke="#d6dee8" strokeWidth="2.5" strokeLinecap="round" />
            ))}

            {/* Animated overlay — forward (green) */}
            {(phase.direction === 'forward') && [
              { d: 'M 80 70  C 160 70,  200 80,  280 80',  delay: '0s' },
              { d: 'M 80 100 C 160 100, 200 80,  280 80',  delay: '0.15s' },
              { d: 'M 80 130 C 160 130, 200 120, 280 120', delay: '0.3s' },
              { d: 'M 80 100 C 160 100, 200 120, 280 120', delay: '0.15s' },
              { d: 'M 280 80  C 370 80,  420 100, 480 100', delay: '0.45s' },
              { d: 'M 280 120 C 370 120, 420 100, 480 100', delay: '0.55s' },
            ].map((p, i) => (
              <path key={`fwd-${i}-${animRun}`} d={p.d} fill="none"
                stroke="#10b981" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="18 12"
                className="m3-infer-flow m3-infer-flow--forward"
                style={{ animationDelay: p.delay }}
              />
            ))}

            {/* Animated overlay — feedback (orange, right to left) */}
            {phase.direction === 'backward' && [
              { d: 'M 480 100 C 420 100, 370 80,  280 80',  delay: '0s' },
              { d: 'M 480 100 C 420 100, 370 120, 280 120', delay: '0.15s' },
              { d: 'M 280 80  C 200 80,  160 100, 80 100',  delay: '0.35s' },
              { d: 'M 280 120 C 200 120, 160 130, 80 130',  delay: '0.45s' },
            ].map((p, i) => (
              <path key={`bwd-${i}-${animRun}`} d={p.d} fill="none"
                stroke="#f97316" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="18 12"
                className="m3-infer-flow m3-infer-flow--backward"
                style={{ animationDelay: p.delay }}
              />
            ))}

            {/* Input nodes */}
            {[70, 100, 130].map((cy, i) => (
              <g key={`in-${i}`}>
                <circle cx="80" cy={cy} r="18" fill="rgba(45,126,255,0.10)" />
                <circle cx="80" cy={cy} r="14" fill="#ffffff"
                  stroke="#3b82f6" strokeWidth="2.5" />
                <text x="80" y={cy + 4} textAnchor="middle"
                  fontSize="11" fontWeight="700" fill="#1e40af">
                  x{i + 1}
                </text>
              </g>
            ))}

            {/* Hidden nodes */}
            {[80, 120].map((cy, i) => (
              <g key={`h-${i}`}
                className={phase.direction === 'backward' ? 'm3-infer-node--refining' : ''}>
                <circle cx="280" cy={cy} r="18" fill="rgba(124,58,237,0.10)" />
                <circle cx="280" cy={cy} r="14" fill="#ffffff"
                  stroke={phase.direction === 'backward' ? '#f97316' : '#7c3aed'}
                  strokeWidth="2.5" />
                <text x="280" y={cy + 4} textAnchor="middle"
                  fontSize="11" fontWeight="700"
                  fill={phase.direction === 'backward' ? '#c2410c' : '#5b21b6'}>
                  h{i + 1}
                </text>
              </g>
            ))}

            {/* Output node */}
            <g>
              <circle cx="480" cy="100" r="24"
                fill={`${phase.outputColor}18`} />
              <circle cx="480" cy="100" r="19" fill="#ffffff"
                stroke={phase.outputColor} strokeWidth="3" />
              <text x="480" y="105" textAnchor="middle"
                fontSize="13" fontWeight="800" fill={phase.outputColor}>
                {phase.outputLabel}
              </text>
            </g>

            {/* Confidence bar */}
            <rect x="410" y="138" width="140" height="8"
              rx="4" fill="#e2e8f0" />
            <rect x="410" y="138"
              width={phase.confidence * 1.4}
              height="8" rx="4" fill={phase.outputColor}
              style={{ transition: 'width 0.6s ease, fill 0.4s ease' }}
            />
            <text x="480" y="162" textAnchor="middle"
              fontSize="10" fill="#64748b" fontWeight="600">
              Confidence {phase.confidence}%
            </text>

            {/* Frozen weights label */}
            {phase.id !== 'idle' && (
              <g>
                <rect x="200" y="170" width="160" height="22"
                  rx="11" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                <text x="280" y="184" textAnchor="middle"
                  fontSize="10" fill="#64748b" fontWeight="700"
                  letterSpacing="0.04em">
                  WEIGHTS FROZEN
                </text>
              </g>
            )}
          </svg>

          {/* Controls */}
          <div className="m3-infer-demo__controls">
            {/* Phase stepper dots */}
            <div className="m3-infer-stepper">
              {PHASES.slice(0, -1).map((p, i) => (
                <div
                  key={p.id}
                  className={[
                    'm3-infer-stepper__dot',
                    i < phaseIndex ? 'is-done' : '',
                    i === phaseIndex ? 'is-active' : '',
                  ].filter(Boolean).join(' ')}
                />
              ))}
            </div>

            <div className="m3-infer-demo__actions">
              {!isComplete ? (
                <button
                  className="m3-btn m3-btn--primary m3-infer-advance"
                  onClick={advance}
                >
                  {phase.buttonLabel}
                </button>
              ) : (
                <div className="m3-stepper-complete">
                  Prediction complete — no weights were changed.
                </div>
              )}
              <button className="m3-btn m3-stepper-reset" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ── Real-world examples ── */}
        <div className="m3-infer-examples">
          {EXAMPLES.map((ex) => (
            <article key={ex.title} className="m3-infer-example">
              <span className="m3-infer-example__icon">{ex.icon}</span>
              <div>
                <h4 className="m3-infer-example__title">{ex.title}</h4>
                <div className="m3-infer-example__row">
                  <span className="m3-infer-example__tag m3-infer-example__tag--brain">Brain</span>
                  <span className="m3-infer-example__text">{ex.brain}</span>
                </div>
                <div className="m3-infer-example__row">
                  <span className="m3-infer-example__tag m3-infer-example__tag--ai">AI</span>
                  <span className="m3-infer-example__text">{ex.ai}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

export default InferenceFeedbackSection
