import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    title: 'The Lab, 1959',
    visual: (
      <svg viewBox="0 0 320 200" style={{ width: '100%', display: 'block' }}>
        <rect x="4" y="4" width="312" height="192" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
        {/* Lab bench */}
        <rect x="40" y="130" width="240" height="8" rx="3" fill="#CBD5E1" />
        {/* Electrode tips */}
        <line x1="100" y1="40" x2="100" y2="90" stroke="#64748B" strokeWidth="2" strokeDasharray="4 3" />
        <line x1="220" y1="40" x2="220" y2="90" stroke="#64748B" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="100" cy="36" r="4" fill="#3B82F6" />
        <circle cx="220" cy="36" r="4" fill="#3B82F6" />
        {/* Cat brain */}
        <ellipse cx="160" cy="100" rx="40" ry="28" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
        <text x="160" y="105" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1E40AF">V1 cortex</text>
        {/* Recording equipment */}
        <rect x="44" y="110" width="32" height="18" rx="4" fill="#EFF6FF" stroke="#93C5FD" />
        <text x="60" y="122" textAnchor="middle" fontSize="7" fill="#1E40AF">EEG</text>
        {/* Oscilloscope */}
        <rect x="244" y="110" width="32" height="18" rx="4" fill="#EFF6FF" stroke="#93C5FD" />
        <path d="M 250,119 L 256,115 L 262,123 L 268,117 L 270,119" stroke="#3B82F6" strokeWidth="1.2" fill="none" />
        <text x="160" y="160" textAnchor="middle" fontSize="9" fill="#64748B">Hubel & Wiesel — recording from a cat's visual cortex</text>
      </svg>
    ),
    body: 'David Hubel and Torsten Wiesel placed tiny electrodes into a cat\'s visual cortex (area V1). They projected simple shapes onto a screen, listening for which images made individual neurons fire.',
  },
  {
    title: 'The Accidental Discovery',
    visual: (
      <svg viewBox="0 0 320 200" style={{ width: '100%', display: 'block' }}>
        <rect x="4" y="4" width="312" height="192" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
        {/* Projector slide */}
        <rect x="30" y="50" width="80" height="100" rx="6" fill="#fff" stroke="#CBD5E1" />
        <line x1="40" y1="60" x2="100" y2="140" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        <text x="70" y="170" textAnchor="middle" fontSize="8" fill="#64748B">angled slide</text>
        {/* Arrow */}
        <path d="M 120,100 L 148,100" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#hw-arrow)" />
        {/* Neuron */}
        <circle cx="200" cy="100" r="30" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2" />
        <text x="200" y="96" textAnchor="middle" fontSize="9" fontWeight="700" fill="#166534">FIRES!</text>
        {/* Spark lines */}
        <line x1="224" y1="78" x2="240" y2="66" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="228" y1="92" x2="250" y2="88" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="224" y1="122" x2="240" y2="134" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="244" cy="63" r="3" fill="#FBBF24" />
        <circle cx="254" cy="86" r="3" fill="#FBBF24" />
        <circle cx="244" cy="137" r="3" fill="#FBBF24" />
        {/* Speaker icon */}
        <text x="280" y="100" textAnchor="middle" fontSize="22">🔊</text>
        <text x="200" y="160" textAnchor="middle" fontSize="8" fill="#64748B">The electrode crackled wildly — but only at one angle</text>
        <defs>
          <marker id="hw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
          </marker>
        </defs>
      </svg>
    ),
    body: 'While adjusting a glass slide, the edge of the slide cast a line at just the right angle — and the neuron fired intensely. They realized the neuron wasn\'t responding to shapes, but to a specific orientation of an edge.',
  },
  {
    title: 'Orientation Selectivity',
    visual: (
      <svg viewBox="0 0 320 200" style={{ width: '100%', display: 'block' }}>
        <rect x="4" y="4" width="312" height="192" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="160" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F172A">Neuron response by edge orientation</text>
        {/* Bars */}
        {[
          { angle: '0°', height: 30, label: '|', color: '#CBD5E1' },
          { angle: '30°', height: 55, label: '/', color: '#93C5FD' },
          { angle: '45°', height: 130, label: '⟋', color: '#3B82F6' },
          { angle: '90°', height: 20, label: '—', color: '#CBD5E1' },
        ].map((bar, i) => {
          const x = 50 + i * 68
          return (
            <g key={bar.angle}>
              <rect x={x} y={170 - bar.height} width="42" height={bar.height} rx="6" fill={bar.color} />
              <text x={x + 21} y={184} textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{bar.angle}</text>
              <text x={x + 21} y={164 - bar.height} textAnchor="middle" fontSize="14">{bar.label}</text>
            </g>
          )
        })}
        {/* Peak marker */}
        <text x="160" y="24" textAnchor="middle" fontSize="8" fill="#2563eb">← peak response at preferred angle →</text>
      </svg>
    ),
    body: 'Each "simple cell" in V1 responds maximally to one specific edge orientation. Rotate the edge away from the preferred angle, and the response drops. This is orientation selectivity — the foundation of biological pattern detection, and the same principle behind convolutional kernels in CNNs.',
  },
]

export default function HubelWieselStory() {
  const [step, setStep] = useState(0)

  return (
    <div className="module2-section" style={{ marginBottom: 0 }}>
      <div className="module2-section-heading">
        <p className="shared-eyebrow" style={{ marginBottom: 8 }}>The Discovery That Started It All</p>
        <h2>Hubel & Wiesel, 1959</h2>
        <p>How two neuroscientists accidentally discovered that individual neurons detect specific edge orientations — and won the Nobel Prize.</p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              background: step === i ? '#2563eb' : '#e2e8f0',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              height: 8,
              transition: 'background 0.2s, width 0.2s',
              width: step === i ? 28 : 8,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8edf5',
            borderRadius: 16,
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            overflow: 'hidden',
            padding: 20,
          }}>
            <div>
              <p style={{
                color: '#2563eb', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', margin: '0 0 6px', textTransform: 'uppercase',
              }}>
                Step {step + 1} of 3
              </p>
              <h3 style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontWeight: 800,
                letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 10px',
              }}>
                {STEPS[step].title}
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                {STEPS[step].body}
              </p>
            </div>
            <div>{STEPS[step].visual}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button
          className="shared-btn shared-btn-ghost shared-btn-sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Previous
        </button>
        <button
          className="shared-btn shared-btn-primary shared-btn-sm"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
