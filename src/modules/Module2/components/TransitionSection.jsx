import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { neuronFires } from '../../../utils/neuronLogic'
import { INITIAL_THRESHOLD, TRANSITION_ARRANGEMENTS } from '../module2Config'

const NEURON_RADIUS = 50
const NEURON_CX = 400
const NEURON_CY = 180
const THRESHOLD_R = NEURON_RADIUS * 0.72

function TransitionSection() {
  const [arrangementIndex, setArrangementIndex] = useState(0)
  const [arrangementsViewed, setArrangementsViewed] = useState(new Set([0]))
  const fillRef = useRef(null)
  const fillLineRef = useRef(null)
  const animRef = useRef(null)

  const current = TRANSITION_ARRANGEMENTS[arrangementIndex]
  const total = current.inputs.reduce((sum, v) => sum + v, 0)
  const fires = neuronFires(total, INITIAL_THRESHOLD)
  const hasSeenMultiple = arrangementsViewed.size >= 2

  const cycleArrangement = () => {
    const next = (arrangementIndex + 1) % TRANSITION_ARRANGEMENTS.length
    setArrangementIndex(next)
    setArrangementsViewed(prev => new Set([...prev, next]))
  }

  useEffect(() => {
    if (!fillRef.current) return
    if (animRef.current) animRef.current.kill()

    const maxFill = NEURON_RADIUS * 2 * 0.85
    const ratio = Math.min(1, total / (INITIAL_THRESHOLD * 1.5))
    const h = maxFill * ratio
    const topY = NEURON_CY + NEURON_RADIUS - h

    animRef.current = gsap.to(fillRef.current, {
      attr: { y: topY, height: Math.max(0, h) },
      duration: 0.35,
      ease: 'power2.out'
    })

    if (fillLineRef.current) {
      gsap.to(fillLineRef.current, {
        attr: { y1: topY, y2: topY },
        duration: 0.35,
        ease: 'power2.out'
      })
    }

    return () => { if (animRef.current) animRef.current.kill() }
  }, [arrangementIndex, total])

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">A. The Problem</p>
        <h2>Same Sum, Different Shapes</h2>
        <p className="m2-section-subtitle">
          This neuron adds incoming signals. Does the arrangement matter?
        </p>
      </div>

      <div className="m2-section-card">
        <svg width={800} height={360} className="m2-svg-block">
          <defs>
            <radialGradient id="somaGradTrans" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="70%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <clipPath id="somaClipTrans">
              <circle cx={NEURON_CX} cy={NEURON_CY} r={NEURON_RADIUS - 2} />
            </clipPath>
          </defs>

          {/* Input pattern 3×3 */}
          <g transform="translate(120, 100)">
            <text x={60} y={-10} textAnchor="middle" fontSize="13" fontWeight="600" fill="#475569">Inputs</text>
            {current.inputs.map((val, idx) => {
              const row = Math.floor(idx / 3)
              const col = idx % 3
              const x = col * 44
              const y = row * 44
              const on = val > 0
              return (
                <g key={idx}>
                  <rect x={x} y={y} width={40} height={40} rx={6} fill={on ? '#3B82F6' : '#F1F5F9'} stroke={on ? '#2563EB' : '#E2E8F0'} strokeWidth={2} />
                  <text x={x + 20} y={y + 25} textAnchor="middle" fontSize="14" fontWeight="600" fill={on ? 'white' : '#94A3B8'}>{val}</text>
                </g>
              )
            })}
          </g>

          {/* Connection */}
          <line x1={260} y1={NEURON_CY} x2={NEURON_CX - NEURON_RADIUS - 10} y2={NEURON_CY} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="6 4" />
          <polygon points={`${NEURON_CX - NEURON_RADIUS - 10},${NEURON_CY - 6} ${NEURON_CX - NEURON_RADIUS - 10},${NEURON_CY + 6} ${NEURON_CX - NEURON_RADIUS},${NEURON_CY}`} fill="#CBD5E1" />
          <text x={310} y={NEURON_CY - 30} textAnchor="middle" fontSize="12" fill="#64748B">sum = {total}</text>

          {/* Neuron */}
          <circle cx={NEURON_CX} cy={NEURON_CY} r={NEURON_RADIUS} fill="url(#somaGradTrans)" stroke={fires ? '#047857' : '#065F46'} strokeWidth={fires ? 3.5 : 2.5} />
          <circle cx={NEURON_CX} cy={NEURON_CY} r={NEURON_RADIUS - 4} fill="none" stroke="#A7F3D0" strokeWidth={1} opacity={0.5} />
          <rect ref={fillRef} x={NEURON_CX - NEURON_RADIUS} y={NEURON_CY + NEURON_RADIUS} width={NEURON_RADIUS * 2} height={0} fill={fires ? '#10B981' : '#34D399'} clipPath="url(#somaClipTrans)" opacity={0.85} />
          <line ref={fillLineRef} x1={NEURON_CX - NEURON_RADIUS + 10} x2={NEURON_CX + NEURON_RADIUS - 10} y1={NEURON_CY + NEURON_RADIUS} y2={NEURON_CY + NEURON_RADIUS} stroke="#059669" strokeWidth={1.5} clipPath="url(#somaClipTrans)" opacity={0.6} />
          <circle cx={NEURON_CX} cy={NEURON_CY} r={THRESHOLD_R} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" opacity={fires ? 0.35 : 0.55} />
          <text x={NEURON_CX} y={NEURON_CY + 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1E293B">Σ={total}</text>

          {/* Output */}
          <line x1={NEURON_CX + NEURON_RADIUS} y1={NEURON_CY} x2={540} y2={NEURON_CY} stroke={fires ? '#10B981' : '#94A3B8'} strokeWidth={fires ? 4 : 2.5} strokeLinecap="round" />
          <g transform={`translate(580, ${NEURON_CY})`}>
            <motion.circle cx={0} cy={0} r={fires ? 28 : 20} fill={fires ? '#D1FAE5' : '#F1F5F9'} stroke={fires ? '#10B981' : '#E2E8F0'} strokeWidth={3} initial={false} animate={{ r: fires ? 28 : 20 }} transition={{ duration: 0.25 }} />
            <text x={0} y={6} textAnchor="middle" fontSize="20" fontWeight="700" fill={fires ? '#047857' : '#94A3B8'}>{fires ? '⚡' : '○'}</text>
            <text x={0} y={50} textAnchor="middle" fontSize="12" fontWeight="600" fill={fires ? '#047857' : '#94A3B8'}>{fires ? 'FIRES' : 'Silent'}</text>
          </g>
        </svg>

        <div className="m2-center-controls">
          <button className="m2-pill-btn" onClick={cycleArrangement}>
            Change arrangement
          </button>
        </div>

        <AnimatePresence>
          {hasSeenMultiple && (
            <>
              <motion.p
                className="m2-insight-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                It knows <em>how much</em> signal there is — not <em>where</em> it comes from.
              </motion.p>
              <motion.p
                className="m2-tease-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                So how do brains tell "where" something is? →
              </motion.p>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default TransitionSection
