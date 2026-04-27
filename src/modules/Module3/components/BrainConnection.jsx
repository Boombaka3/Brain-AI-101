import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'

const STAGES = ['Observe', 'Compare', 'Feedback', 'Adjust']

function BrainConnection() {
  const [step, setStep] = useState(0)
  const aiSignalRef = useRef(null)
  const brainSignalRef = useRef(null)
  const aiWeightRef = useRef(null)
  const synapseRef = useRef(null)

  const c = step >= 1
  const s = step >= 2
  const a = step >= 3
  const aiInput = [1, 0, 1]
  const aiWeightVals = [0.4, 0.7, a ? 0.35 : 0.2]
  const aiResponse = aiInput.reduce((acc, v, i) => acc + v * aiWeightVals[i], 0)
  const aiPred = aiResponse >= 0.6 ? 1 : 0
  const aiTarget = 1
  const mismatch = c && aiPred !== aiTarget

  useEffect(() => {
    if (!aiSignalRef.current || !brainSignalRef.current || !aiWeightRef.current || !synapseRef.current) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    gsap.set([aiSignalRef.current, brainSignalRef.current], { opacity: 0, x: 0 })
    if (step === 2) {
      tl.fromTo(aiSignalRef.current, { opacity: 0, x: 0 }, { opacity: 1, x: -110, duration: 0.45 }).to(aiSignalRef.current, { opacity: 0, duration: 0.14 })
      tl.fromTo(brainSignalRef.current, { opacity: 0, x: 0 }, { opacity: 1, x: -108, duration: 0.45 }, '<').to(brainSignalRef.current, { opacity: 0, duration: 0.14 })
    }
    tl.to(aiWeightRef.current, { attr: { width: step >= 3 ? 132 : 92 }, duration: 0.26 })
      .to(synapseRef.current, { attr: { 'stroke-width': step >= 3 ? 12 : 7 }, duration: 0.26 }, '<')
  }, [step])

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">D. Brain Connection</p>
        <h2>Dopamine as Prediction Error</h2>
        <p className="m3-section-subtitle">
          Dopamine doesn't signal pleasure — it signals "better or worse than expected."
        </p>
      </div>

      {/* Dopamine panel */}
      <div className="module3-dopamine-panel">
        <p className="module3-dopamine-label">Dopamine prediction error — 3 cases</p>
        <div className="module3-dopamine-row">
          <div className="module3-dopamine-card">
            <div className="module3-dopamine-emoji">🍽️</div>
            <p className="module3-dopamine-title">Expected food arrives</p>
            <p className="module3-dopamine-desc">Prediction matches reality. No surprise.</p>
            <span className="module3-dopamine-signal module3-dopamine--neutral">Dopamine = 0</span>
          </div>
          <div className="module3-dopamine-card" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <div className="module3-dopamine-emoji">🎁</div>
            <p className="module3-dopamine-title">Unexpected food arrives</p>
            <p className="module3-dopamine-desc">Better than expected — learn to repeat.</p>
            <span className="module3-dopamine-signal module3-dopamine--positive">Dopamine ↑ spike</span>
          </div>
          <div className="module3-dopamine-card" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
            <div className="module3-dopamine-emoji">😞</div>
            <p className="module3-dopamine-title">Predicted food missing</p>
            <p className="module3-dopamine-desc">Worse than expected — update model.</p>
            <span className="module3-dopamine-signal module3-dopamine--negative">Dopamine ↓ dip</span>
          </div>
        </div>
        <div className="module3-dopamine-bridge">
          This is identical to the error term in supervised learning weight updates: <strong>error = expected − actual</strong>. Positive error strengthens connections; negative error weakens them.
        </div>
      </div>

      <div className="m3-section-card">
        {/* Stage pills */}
        <div className="m3-controls">
          {STAGES.map((label, i) => (
            <motion.span
              key={label}
              className={`m3-stage-pill${step >= i ? ' m3-stage-pill--active' : ''}`}
              animate={{ opacity: step >= i ? 1 : 0.7 }}
            >
              {label}
            </motion.span>
          ))}
        </div>

        <svg viewBox="0 0 880 390" className="m3-svg-block">
          <rect x="16" y="16" width="848" height="358" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />

          {/* AI Learning panel */}
          <g transform="translate(40,76)">
            <rect x="0" y="0" width="380" height="280" rx="10" fill="#fff" stroke="#BFDBFE" />
            <text x="20" y="28" fontSize="16" fontWeight="700" fill="#1E40AF">AI Learning</text>

            <text x="20" y="52" fontSize="11" fill="#64748B">inputs</text>
            {aiInput.map((v, i) => (
              <g key={i} transform={`translate(${20 + i * 38},58)`}>
                <rect width="30" height="28" rx="6" fill="#EFF6FF" stroke="#93C5FD" />
                <text x="15" y="19" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A8A">{v}</text>
              </g>
            ))}

            <text x="146" y="52" fontSize="11" fill="#64748B">weights</text>
            {aiWeightVals.map((v, i) => (
              <g key={i} transform={`translate(${146 + i * 42},58)`}>
                <rect width="34" height="28" rx="6" fill={a && i === 2 ? '#DCFCE7' : '#F8FAFC'} stroke={a && i === 2 ? '#22C55E' : '#CBD5E1'} />
                <text x="17" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">{v.toFixed(2)}</text>
              </g>
            ))}

            <text x="20" y="112" fontSize="11" fill="#64748B">weighted response</text>
            <rect x="20" y="118" width="112" height="34" rx="8" fill="#fff" stroke="#CBD5E1" />
            <motion.text key={`ai-r-${step}-${aiResponse}`} x="76" y="140" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E293B" initial={{ opacity: 0.45, y: 144 }} animate={{ opacity: 1, y: 140 }} transition={{ duration: 0.2 }}>
              {aiResponse.toFixed(2)}
            </motion.text>

            <rect x="148" y="118" width="84" height="34" rx="8" fill="#fff" stroke="#CBD5E1" />
            <text x="190" y="131" textAnchor="middle" fontSize="10" fill="#64748B">prediction</text>
            <text x="190" y="145" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E293B">{aiPred}</text>

            <rect x="248" y="118" width="84" height="34" rx="8" fill="#fff" stroke="#CBD5E1" />
            <text x="290" y="131" textAnchor="middle" fontSize="10" fill="#64748B">target</text>
            <text x="290" y="145" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E293B">{aiTarget}</text>

            {c && (
              <motion.g animate={mismatch ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <rect x="20" y="166" width="312" height="30" rx="8" fill={mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={mismatch ? '#F59E0B' : '#22C55E'} />
                <text x="176" y="185" textAnchor="middle" fontSize="12" fontWeight="700" fill={mismatch ? '#B45309' : '#166534'}>
                  {mismatch ? 'Mismatch shown' : 'No mismatch'}
                </text>
              </motion.g>
            )}

            <line x1="332" y1="135" x2="212" y2="222" stroke={s ? '#F59E0B' : '#CBD5E1'} strokeDasharray="5 4" strokeWidth="2" />
            <circle ref={aiSignalRef} cx="332" cy="135" r="7" fill="#F59E0B" opacity="0" />
            {s && <text x="222" y="240" fontSize="12" fill="#B45309">feedback signal</text>}

            <text x="20" y="255" fontSize="11" fill="#64748B">changed weight</text>
            <rect x="20" y="262" width="150" height="12" rx="6" fill="#E2E8F0" />
            <rect ref={aiWeightRef} x="20" y="262" width="92" height="12" rx="6" fill="#3B82F6" />
          </g>

          {/* Brain Learning panel */}
          <g transform="translate(458,76)">
            <rect x="0" y="0" width="380" height="280" rx="10" fill="#fff" stroke="#BBF7D0" />
            <text x="20" y="28" fontSize="16" fontWeight="700" fill="#166534">Brain Learning</text>

            <circle cx="92" cy="86" r="30" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
            <text x="92" y="91" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E40AF">Pre neuron</text>
            <circle cx="248" cy="86" r="34" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
            <text x="248" y="91" textAnchor="middle" fontSize="11" fontWeight="700" fill="#166534">Post neuron</text>

            <line ref={synapseRef} x1="124" y1="86" x2="214" y2="86" stroke={c ? '#F59E0B' : '#22C55E'} strokeWidth="7" strokeLinecap="round" />
            <text x="148" y="70" fontSize="10" fill="#64748B">connection</text>

            <text x="20" y="154" fontSize="12" fill="#334155">desired response: <tspan fontWeight="700">1</tspan></text>
            <text x="20" y="176" fontSize="12" fill="#334155">current response: <tspan fontWeight="700">{a ? '1' : '0'}</tspan></text>
            {c && <text x="20" y="198" fontSize="12" fill="#B45309">mismatch: {a ? 'resolved' : 'present'}</text>}

            <line x1="250" y1="176" x2="142" y2="140" stroke={s ? '#F59E0B' : '#CBD5E1'} strokeDasharray="5 4" strokeWidth="2" />
            <circle ref={brainSignalRef} cx="250" cy="176" r="7" fill="#F59E0B" opacity="0" />
            {s && <text x="260" y="196" fontSize="12" fill="#B45309">feedback signal</text>}

            <text x="20" y="236" fontSize="11" fill="#64748B">connection strength</text>
            <rect x="20" y="244" width="160" height="12" rx="6" fill="#E2E8F0" />
            <motion.rect x="20" y="244" width={a ? 126 : 84} height="12" rx="6" fill="#22C55E" animate={{ width: a ? 126 : 84 }} transition={{ duration: 0.24 }} />
          </g>
        </svg>

        <div className="m3-controls">
          <button className="m3-btn m3-btn--primary" onClick={() => setStep(s => Math.min(3, s + 1))}>Next Step</button>
          <button className="m3-btn" onClick={() => setStep(0)}>Reset</button>
        </div>

        <p className="m3-takeaway">Brains and AI both adjust after mismatch.</p>
      </div>
    </section>
  )
}

export default BrainConnection
