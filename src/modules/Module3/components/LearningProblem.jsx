import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'

function LearningProblem() {
  const [step, setStep] = useState(0)
  const pulseRef = useRef(null)

  useEffect(() => {
    if (!pulseRef.current) return
    gsap.fromTo(pulseRef.current, { scale: 0.96, opacity: 0.85 }, { scale: 1, opacity: 1, duration: 0.26 })
  }, [step])

  const p = step >= 1
  const f = step >= 2
  const u = step >= 3

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">A. The Problem</p>
        <h2>From Fixed Weights to Learning Weights</h2>
        <p className="m3-section-subtitle">
          In Module 2, we hand-picked the weights. Real brains learn their own.
          Click the steps — watch what stays the same and what changes.
        </p>
      </div>

      <div className="m3-human-framing">
        <p>Think about learning to ride a bike. You fell, adjusted, tried again. That's the core loop: <strong>predict → fail → correct</strong>.</p>
        <p>The same loop runs inside every learning system — including the one you're about to see.</p>
      </div>

      <div className="m3-section-card">
        <motion.div ref={pulseRef}>
          <svg viewBox="0 0 880 340" className="m3-svg-block">
            <rect x="16" y="16" width="848" height="308" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />

            {/* Fixed weights panel */}
            <g transform="translate(40,42)">
              <rect x="0" y="0" width="380" height="250" rx="10" fill="#fff" stroke="#DBEAFE" />
              <text x="20" y="30" fontSize="16" fontWeight="700" fill="#1E40AF">Fixed Weights</text>
              <text x="20" y="54" fontSize="12" fill="#64748B">Same weights each run.</text>
              {[1, 0, 1].map((n, i) => (
                <g key={i} transform={`translate(${20 + i * 42},78)`}>
                  <rect width="32" height="32" rx="6" fill="#EFF6FF" stroke="#93C5FD" />
                  <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E3A8A">{n}</text>
                </g>
              ))}
              {[0.4, 0.7, 0.2].map((w, i) => (
                <g key={i} transform={`translate(${20 + i * 46},126)`}>
                  <rect width="36" height="30" rx="6" fill="#F8FAFC" stroke="#CBD5E1" />
                  <text x="18" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">{w}</text>
                </g>
              ))}
              {p && (
                <g>
                  <line x1="194" y1="96" x2="290" y2="96" stroke="#3B82F6" strokeWidth="2" />
                  <rect x="300" y="80" width="62" height="34" rx="8" fill="#DBEAFE" stroke="#60A5FA" />
                  <text x="331" y="101" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E3A8A">0.62</text>
                </g>
              )}
            </g>

            {/* Learning weights panel */}
            <g transform="translate(458,42)">
              <rect x="0" y="0" width="380" height="250" rx="10" fill="#fff" stroke="#BBF7D0" />
              <text x="20" y="30" fontSize="16" fontWeight="700" fill="#166534">Learning Weights</text>
              <text x="20" y="54" fontSize="12" fill="#64748B">Feedback changes weights.</text>
              {[1, 0, 1].map((n, i) => (
                <g key={i} transform={`translate(${20 + i * 42},78)`}>
                  <rect width="32" height="32" rx="6" fill="#ECFDF5" stroke="#86EFAC" />
                  <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#166534">{n}</text>
                </g>
              ))}
              {[0.4, 0.7, u ? 0.35 : 0.2].map((w, i) => (
                <g key={i} transform={`translate(${20 + i * 46},126)`}>
                  <rect width="36" height="30" rx="6" fill={u && i === 2 ? '#DCFCE7' : '#F8FAFC'} stroke={u && i === 2 ? '#22C55E' : '#CBD5E1'} />
                  <text x="18" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">{w}</text>
                </g>
              ))}
              {p && (
                <g>
                  <line x1="194" y1="96" x2="290" y2="96" stroke="#16A34A" strokeWidth="2" />
                  <rect x="300" y="80" width="62" height="34" rx="8" fill="#ECFDF5" stroke="#4ADE80" />
                  <text x="331" y="101" textAnchor="middle" fontSize="13" fontWeight="700" fill="#166534">{u ? '0.70' : '0.62'}</text>
                </g>
              )}
              {f && <text x="20" y="184" fontSize="12" fill="#B45309">Mismatch: weights adjust next.</text>}
            </g>
          </svg>
        </motion.div>

        <div className="m3-controls">
          <button className="m3-btn" onClick={() => setStep(1)}>Step 1: Show Prediction</button>
          <button className="m3-btn" onClick={() => setStep(2)}>Step 2: Show Feedback</button>
          <button className="m3-btn" onClick={() => setStep(3)}>Step 3: Apply Update</button>
          <button className="m3-btn" onClick={() => setStep(0)}>Reset</button>
        </div>

        <p className="m3-takeaway">Learning starts when feedback changes weights.</p>
      </div>
    </section>
  )
}

export default LearningProblem
