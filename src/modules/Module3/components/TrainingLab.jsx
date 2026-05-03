import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import LossChart from './LossChart'
import LearningRateExplorer from './LearningRateExplorer'

const TRAINING_THRESHOLD = 5
const TRAINING_INPUTS = [[2, 3, 1], [1, 2, 2], [3, 1, 2], [2, 2, 1]]
const TRAINING_TARGETS = [1, 0, 1, 0]

const calc = (input, w, target) => {
  const c = input.map((v, i) => v * w[i])
  const sum = c.reduce((a, b) => a + b, 0)
  const pred = sum >= TRAINING_THRESHOLD ? 1 : 0
  return { c, sum, pred, mismatch: pred !== target }
}

function TrainingLab() {
  const [step, setStep] = useState(0)
  const [weights, setWeights] = useState([1, 1, 1])
  const [delta, setDelta] = useState([0, 0, 0])
  const [run, setRun] = useState(0)
  const [history, setHistory] = useState([])

  const tInput = TRAINING_INPUTS[step % TRAINING_INPUTS.length]
  const tTarget = TRAINING_TARGETS[step % TRAINING_TARGETS.length]
  const tCalc = useMemo(() => calc(tInput, weights, tTarget), [tInput, weights, tTarget])

  const advance = () => {
    setRun(r => r + 1)
    if (!tCalc.mismatch) {
      const d = [0, 0, 0]
      setDelta(d)
      setHistory(h => [...h.slice(-5), { step: step + 1, pred: tCalc.pred, target: tTarget, mismatch: false, delta: d }])
      setStep(s => s + 1)
      return
    }
    const dir = tTarget === 1 ? 1 : -1
    const max = Math.max(...tCalc.c.map(v => Math.abs(v)), 1)
    const d = tCalc.c.map(v => Number(((0.08 + (Math.abs(v) / max) * 0.12) * dir).toFixed(2)))
    setDelta(d)
    setHistory(h => [...h.slice(-5), { step: step + 1, pred: tCalc.pred, target: tTarget, mismatch: true, delta: d }])
    setWeights(p => p.map((w, i) => Number((w + d[i]).toFixed(2))))
    setStep(s => s + 1)
  }

  const reset = () => {
    setStep(0); setWeights([1, 1, 1]); setDelta([0, 0, 0]); setRun(0); setHistory([])
  }

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. Training</p>
        <h2>Practice Changes Weights</h2>
        <p className="m3-section-subtitle">Run a step. Misses push weights to adjust.</p>
      </div>

      <LossChart trainingStep={step} mismatch={tCalc.mismatch} />
      <LearningRateExplorer />

      <div className="m3-section-card">
        <svg viewBox="0 0 880 340" className="m3-svg-block">
          <defs>
            <marker id="tr-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
            </marker>
          </defs>
          <rect x="16" y="16" width="848" height="308" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
          <text x="36" y="42" fontSize="16" fontWeight="700" fill="#1E293B">AI Training Lab</text>
          <text x="36" y="60" fontSize="12" fill="#64748B">One flow: run, compare, update.</text>
          <text x="720" y="42" fontSize="11" fill="#64748B">Example {(step % TRAINING_INPUTS.length) + 1}</text>

          <text x="38" y="90" fontSize="11" fill="#64748B">Inputs</text>
          {tInput.map((v, i) => (
            <g key={`in-${i}`} transform={`translate(${36 + i * 52},98)`}>
              <rect width="44" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
              <text x="22" y="18" textAnchor="middle" fontSize="10" fill="#64748B">x{i + 1}</text>
              <text x="22" y="33" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1E293B">{v}</text>
            </g>
          ))}

          <text x="204" y="90" fontSize="11" fill="#64748B">Weights</text>
          {weights.map((w, i) => (
            <g key={`w-${i}`} transform={`translate(${202 + i * 58},98)`}>
              <rect width="50" height="44" rx="8" fill={delta[i] !== 0 ? '#EFF6FF' : '#fff'} stroke={delta[i] !== 0 ? '#60A5FA' : '#CBD5E1'} />
              <text x="25" y="18" textAnchor="middle" fontSize="10" fill="#64748B">w{i + 1}</text>
              <motion.text key={`${run}-${i}-${w}`} x="25" y="34" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E293B" initial={{ opacity: 0.5, y: 38 }} animate={{ opacity: 1, y: 34 }} transition={{ duration: 0.24 }}>
                {w.toFixed(2)}
              </motion.text>
            </g>
          ))}

          <text x="390" y="90" fontSize="11" fill="#64748B">Contributions</text>
          {tCalc.c.map((v, i) => (
            <g key={`c-${i}`} transform={`translate(${388 + i * 58},98)`}>
              <rect width="50" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
              <motion.rect key={`cflash-${run}-${i}`} width="50" height="44" rx="8" fill="#DBEAFE" initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }} />
              <text x="25" y="18" textAnchor="middle" fontSize="10" fill="#64748B">c{i + 1}</text>
              <text x="25" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E293B">{v.toFixed(2)}</text>
            </g>
          ))}

          <text x="572" y="90" fontSize="11" fill="#64748B">Sum</text>
          <rect x="570" y="98" width="62" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
          <text x="601" y="125" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1E293B">{tCalc.sum.toFixed(2)}</text>

          <text x="648" y="90" fontSize="11" fill="#64748B">Prediction</text>
          <rect x="646" y="98" width="62" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
          <motion.text key={`pred-${run}-${tCalc.pred}`} x="677" y="125" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1E293B" initial={{ opacity: 0.45, y: 130 }} animate={{ opacity: 1, y: 125 }} transition={{ duration: 0.22 }}>
            {tCalc.pred}
          </motion.text>

          <text x="724" y="90" fontSize="11" fill="#64748B">Target</text>
          <rect x="722" y="98" width="62" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
          <text x="753" y="125" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1E293B">{tTarget}</text>

          <text x="796" y="90" fontSize="11" fill="#64748B">Update</text>
          <rect x="794" y="98" width="58" height="44" rx="8" fill="#fff" stroke="#CBD5E1" />
          <text x="823" y="126" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">{tCalc.mismatch ? 'shift' : 'hold'}</text>

          {/* Arrows */}
          {[[170, 194], [358, 382], [546, 566], [634, 642], [710, 718], [786, 790]].map(([x1, x2], i) => (
            <line key={i} x1={x1} y1="120" x2={x2} y2="120" stroke="#94A3B8" strokeWidth="1.4" markerEnd="url(#tr-arr)" />
          ))}

          <motion.g key={`mm-${run}-${tCalc.mismatch}`} animate={tCalc.mismatch ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
            <rect x="36" y="154" width="300" height="30" rx="8" fill={tCalc.mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={tCalc.mismatch ? '#F59E0B' : '#22C55E'} />
            <text x="52" y="173" fontSize="12" fontWeight="700" fill={tCalc.mismatch ? '#B45309' : '#166534'}>
              {tCalc.mismatch ? 'Mismatch: weights update on this step.' : 'Match: no weight update this step.'}
            </text>
          </motion.g>

          <text x="356" y="172" fontSize="11" fill="#64748B">Weight deltas — backpropagation</text>
          {delta.map((d, i) => (
            <g key={`d-${i}`} transform={`translate(${436 + i * 84},154)`}>
              <rect width="74" height="30" rx="8" fill={d !== 0 ? '#EFF6FF' : '#fff'} stroke={d !== 0 ? '#93C5FD' : '#CBD5E1'} />
              <text x="37" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill={d > 0 ? '#1D4ED8' : d < 0 ? '#B45309' : '#64748B'}>
                {d > 0 ? `+${d.toFixed(2)}` : d.toFixed(2)}
              </text>
            </g>
          ))}

          <text x="36" y="216" fontSize="11" fill="#64748B">Recent history</text>
          {history.slice(-6).map((h, i) => (
            <g key={`h-${h.step}-${i}`} transform={`translate(${36 + i * 136},224)`}>
              <rect width="126" height="28" rx="8" fill="#fff" stroke={h.mismatch ? '#FCD34D' : '#BBF7D0'} />
              <text x="8" y="18" fontSize="10" fill="#334155">s{h.step} p{h.pred}/t{h.target} {h.mismatch ? 'mismatch' : 'match'}</text>
            </g>
          ))}
          {history.slice(-6).map((h, i) => (
            <g key={`hb-${h.step}-${i}`} transform={`translate(${36 + i * 136},260)`}>
              {[0, 1, 2].map(j => (
                <rect key={j} x={j * 40} y="0" width="34" height="8" rx="4" fill={Math.abs(h.delta[j]) > 0 ? '#60A5FA' : '#E2E8F0'} />
              ))}
            </g>
          ))}
        </svg>

        <div className="m3-backprop-callout">
          <strong>Backpropagation</strong> — the algorithm that distributes blame for a wrong answer back through every weight that contributed to it.
        </div>

        <div className="m3-controls">
          <button className="m3-btn m3-btn--primary" onClick={advance}>Advance Step</button>
          <button className="m3-btn" onClick={reset}>Reset</button>
        </div>

        <p className="m3-takeaway">Wrong guess → weight shift → better next guess.</p>
      </div>
    </section>
  )
}

export default TrainingLab
