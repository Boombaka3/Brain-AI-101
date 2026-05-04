import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import DeepLearningBridge from './DeepLearningBridge'

function BigPicture() {
  const [inputs, setInputs] = useState([2, 3, 1])
  const [contextOn, setContextOn] = useState(false)
  const [focus, setFocus] = useState('ai')
  const thrRef = useRef(null)

  const sum = inputs.reduce((a, v) => a + v, 0)
  const baseThr = 5
  const ctxThr = contextOn ? 6.2 : 5

  useEffect(() => {
    if (!thrRef.current) return
    gsap.to(thrRef.current, { x: contextOn ? 36 : 0, duration: 0.24 })
  }, [contextOn])

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">F. Big Picture</p>
        <h2>Context, Inference, and What Changes</h2>
        <p className="m3-section-subtitle">
          Training changes memory. Inference changes this choice. Context shifts the threshold without touching weights.
        </p>
      </div>

      {/* Inference comparison */}
      <div className="m3-section-card">
        <svg viewBox="0 0 880 340" className="m3-svg-block">
          <rect x="16" y="16" width="848" height="308" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />

          {/* Without context */}
          <g transform="translate(40,42)">
            <rect x="0" y="0" width="380" height="250" rx="10" fill="#fff" stroke="#CBD5E1" />
            <text x="20" y="28" fontSize="16" fontWeight="700" fill="#1E293B">Without Context</text>
            <text x="20" y="47" fontSize="11" fill="#64748B">Weights fixed</text>

            <text x="20" y="72" fontSize="10" fill="#94A3B8">inputs</text>
            {inputs.map((v, i) => (
              <g key={`l-in-${i}`} transform={`translate(${20 + i * 40},78)`}>
                <rect width="32" height="28" rx="6" fill="#EFF6FF" stroke="#93C5FD" />
                <text x="16" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E3A8A">{v}</text>
              </g>
            ))}
            <text x="160" y="72" fontSize="10" fill="#94A3B8">weights (locked)</text>
            {[1, 1, 1].map((w, i) => (
              <g key={`l-w-${i}`} transform={`translate(${160 + i * 40},78)`}>
                <rect width="32" height="28" rx="6" fill="#F8FAFC" stroke="#CBD5E1" />
                <text x="16" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B">{w.toFixed(1)}</text>
              </g>
            ))}

            <text x="20" y="131" fontSize="11" fill="#334155">Score: {sum.toFixed(2)}</text>
            <text x="20" y="148" fontSize="11" fill="#334155">Threshold: {baseThr.toFixed(1)}</text>
            <rect x="20" y="156" width="250" height="12" rx="6" fill="#E2E8F0" />
            <rect x={20 + baseThr * 30} y="152" width="2" height="20" fill="#64748B" />
            <rect x="20" y="159" width={Math.min(250, sum * 30)} height="6" rx="3" fill="#94A3B8" />

            <rect x="20" y="186" width="250" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
            <text x="145" y="212" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E293B">
              Decision: {sum >= baseThr ? 'Action A' : 'Action B'}
            </text>
          </g>

          {/* With context */}
          <g transform="translate(458,42)">
            <rect x="0" y="0" width="380" height="250" rx="10" fill="#fff" stroke="#CBD5E1" />
            <text x="20" y="28" fontSize="16" fontWeight="700" fill="#1E293B">With Context</text>
            <text x="20" y="47" fontSize="11" fill="#64748B">Weights fixed</text>

            <text x="20" y="72" fontSize="10" fill="#94A3B8">inputs</text>
            {inputs.map((v, i) => (
              <g key={`r-in-${i}`} transform={`translate(${20 + i * 40},78)`}>
                <rect width="32" height="28" rx="6" fill="#EFF6FF" stroke="#93C5FD" />
                <text x="16" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E3A8A">{v}</text>
              </g>
            ))}
            <text x="160" y="72" fontSize="10" fill="#94A3B8">weights (locked)</text>
            {[1, 1, 1].map((w, i) => (
              <g key={`r-w-${i}`} transform={`translate(${160 + i * 40},78)`}>
                <rect width="32" height="28" rx="6" fill="#F8FAFC" stroke="#CBD5E1" />
                <text x="16" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B">{w.toFixed(1)}</text>
              </g>
            ))}

            <text x="20" y="131" fontSize="11" fill="#334155">Score: {sum.toFixed(2)}</text>
            <text x="20" y="148" fontSize="11" fill="#334155">Context threshold: {ctxThr.toFixed(1)}</text>
            <rect x="20" y="156" width="250" height="12" rx="6" fill="#E2E8F0" />
            <rect ref={thrRef} x={20 + baseThr * 30} y="152" width="2" height="20" fill="#8B5CF6" />
            <rect x="20" y="159" width={Math.min(250, sum * 30)} height="6" rx="3" fill={contextOn ? '#8B5CF6' : '#94A3B8'} />

            {contextOn && (
              <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <rect x="282" y="154" width="84" height="22" rx="11" fill="#EEF2FF" stroke="#A78BFA" />
                <text x="324" y="168" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6D28D9">Context ON</text>
              </motion.g>
            )}

            <rect x="20" y="186" width="250" height="40" rx="8" fill={contextOn ? '#EEF2FF' : '#F8FAFC'} stroke="#CBD5E1" />
            <motion.text key={`ctx-${contextOn}-${sum}-${ctxThr}`} x="145" y="212" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E293B" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              Decision: {sum >= ctxThr ? 'Action A' : 'Action B'}
            </motion.text>
          </g>
        </svg>

        <div className="m3-controls">
          {inputs.map((v, i) => (
            <div key={i} className="m3-input-slider">
              <span className="m3-input-slider-label">x{i + 1}</span>
              <input type="range" min="0" max="5" value={v} onChange={(e) => setInputs(p => p.map((n, j) => j === i ? Number(e.target.value) : n))} />
              <span className="m3-input-slider-val">{v}</span>
            </div>
          ))}
          <button className={`m3-btn${contextOn ? ' m3-btn--active' : ''}`} onClick={() => setContextOn(v => !v)}>
            {contextOn ? 'Context ON' : 'Context OFF'}
          </button>
          <button className="m3-btn" onClick={() => { setInputs([2, 2, 2]) }}>Try Ambiguous Case</button>
          <button className="m3-btn" onClick={() => { setInputs([2, 3, 1]); setContextOn(false) }}>Reset</button>
        </div>

        <p className="m3-takeaway">Training changes memory. Inference changes this choice.</p>
      </div>

      {/* Synthesis recap */}
      <div className="m3-section-card">
        <svg viewBox="0 0 880 300" className="m3-svg-block">
          <rect x="16" y="16" width="848" height="268" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="36" y="42" fontSize="16" fontWeight="700" fill="#1E293B">Quick Recap</text>
          <text x="36" y="60" fontSize="12" fill="#64748B">Click a panel to see what changes most.</text>

          {[
            { id: 'brain', t: 'Brain', c: 'Current vs goal', f: 'Signal', x: 'Connection strength' },
            { id: 'ai', t: 'AI Training', c: 'Guess vs target', f: 'Error', x: 'Weights' },
            { id: 'inference', t: 'Inference', c: 'Decision vs context', f: 'Context', x: 'Cut line' }
          ].map((p, i) => {
            const active = focus === p.id
            return (
              <g key={p.id} transform={`translate(${36 + i * 270},80)`} onClick={() => setFocus(p.id)} style={{ cursor: 'pointer' }}>
                <motion.rect width="250" height="152" rx="10" fill="#fff" stroke={active ? '#3B82F6' : '#CBD5E1'} animate={{ scale: active ? 1.01 : 1 }} transition={{ duration: 0.2 }} />
                <text x="16" y="28" fontSize="14" fontWeight="700" fill={active ? '#1E3A8A' : '#1E293B'}>{p.t}</text>

                <rect x="16" y="42" width="218" height="28" rx="7" fill={active ? '#EEF2FF' : '#F8FAFC'} stroke={active ? '#A5B4FC' : '#E2E8F0'} />
                <text x="26" y="53" fontSize="10" fill={active ? '#1E3A8A' : '#64748B'}>Compare</text>
                <text x="26" y="64" fontSize="11" fontWeight="700" fill={active ? '#1E3A8A' : '#334155'}>{p.c}</text>

                <rect x="16" y="76" width="218" height="28" rx="7" fill={active ? '#FEF3C7' : '#F8FAFC'} stroke={active ? '#F59E0B' : '#E2E8F0'} />
                <text x="26" y="87" fontSize="10" fill={active ? '#92400E' : '#64748B'}>Feedback</text>
                <text x="26" y="98" fontSize="11" fontWeight="700" fill={active ? '#92400E' : '#334155'}>{p.f}</text>

                <motion.rect x="16" y="110" width="218" height="32" rx="8" fill={active ? '#DBEAFE' : '#F8FAFC'} stroke={active ? '#3B82F6' : '#E2E8F0'} animate={{ opacity: active ? 1 : 0.84 }} transition={{ duration: 0.2 }} />
                <text x="26" y="122" fontSize="10" fill={active ? '#1E3A8A' : '#64748B'}>Changes</text>
                <text x="26" y="136" fontSize={active ? '12' : '11'} fontWeight="700" fill={active ? '#1D4ED8' : '#334155'}>{p.x}</text>
              </g>
            )
          })}

          <rect x="36" y="250" width="808" height="24" rx="8" fill="#EAF3FF" stroke="#D4E5FF" />
          <text x="440" y="266" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E3A8A">
            Feedback drives adaptation: system change or decision change.
          </text>
        </svg>
      </div>

      <DeepLearningBridge />
    </section>
  )
}

export default BigPicture
