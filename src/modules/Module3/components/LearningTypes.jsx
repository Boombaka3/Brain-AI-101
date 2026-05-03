import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

function LearningTypes({ isMobile }) {
  const [supWeights, setSupWeights] = useState([1, 1, 1])
  const [supTarget, setSupTarget] = useState(1)
  const [supShowFeedback, setSupShowFeedback] = useState(false)
  const [supChanged, setSupChanged] = useState([false, false, false])

  const [unsupStage, setUnsupStage] = useState(0)
  const [unsupPoints, setUnsupPoints] = useState([
    { id: 1, x: 0.2, y: 0.3, g: null }, { id: 2, x: 0.28, y: 0.39, g: null },
    { id: 3, x: 0.68, y: 0.72, g: null }, { id: 4, x: 0.62, y: 0.56, g: null },
    { id: 5, x: 0.45, y: 0.58, g: null }
  ])

  const [rlState, setRlState] = useState(1)
  const [rlPrefs, setRlPrefs] = useState({ left: 0.5, up: 0.5, right: 0.5 })
  const [rlReward, setRlReward] = useState(null)
  const [rlLastAction, setRlLastAction] = useState(null)

  const sCalc = useMemo(() => {
    const c = [2, 3, 1].map((v, i) => v * supWeights[i])
    const sum = c.reduce((a, b) => a + b, 0)
    const pred = sum >= 5 ? 1 : 0
    return { c, sum, pred, mismatch: pred !== supTarget }
  }, [supWeights, supTarget])

  const applySup = () => {
    setSupShowFeedback(true)
    if (!sCalc.mismatch) { setSupChanged([false, false, false]); return }
    const dir = supTarget === 1 ? 1 : -1
    const max = Math.max(...sCalc.c.map(v => Math.abs(v)), 1)
    const d = sCalc.c.map(v => Number(((0.08 + (Math.abs(v) / max) * 0.12) * dir).toFixed(2)))
    setSupChanged(d.map(v => Math.abs(v) > 0))
    setSupWeights(prev => prev.map((w, i) => Number((w + d[i]).toFixed(2))))
  }

  const act = (dir) => {
    const reward = ({ left: 1, up: 0.4, right: -0.6 }[dir]) ?? 0
    setRlLastAction(dir)
    setRlReward(reward)
    setRlPrefs(p => ({ ...p, [dir]: Math.max(0, Math.min(1.35, Number((p[dir] + reward * 0.25).toFixed(2)))) }))
    setRlState(s => (dir === 'left' ? Math.max(0, s - 1) : dir === 'right' ? Math.min(2, s + 1) : s))
  }

  const prefMax = Math.max(1, rlPrefs.left, rlPrefs.up, rlPrefs.right)
  const strongest = Object.entries(rlPrefs).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">B. Three Ways to Learn</p>
        <h2>Same Pattern, Different Feedback</h2>
        <p className="m3-section-subtitle">Each lab compares, gets feedback, then changes.</p>
      </div>

      <div className="m3-types-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
        {/* Supervised */}
        <div className="m3-type-card">
          <div className="m3-type-title">Supervised</div>
          <svg viewBox="0 0 300 180" className="m3-svg-block">
            <rect x="6" y="6" width="288" height="168" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
            {[2, 3, 1].map((v, i) => (
              <g key={i} transform={`translate(${18 + i * 52},28)`}>
                <rect width="44" height="56" rx="8" fill="#fff" stroke={supChanged[i] ? '#60A5FA' : '#CBD5E1'} />
                <text x="22" y="18" textAnchor="middle" fontSize="10" fill="#64748B">x{i + 1}</text>
                <text x="22" y="34" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E293B">{v}</text>
                <text x="22" y="48" textAnchor="middle" fontSize="10" fill="#334155">w{supWeights[i].toFixed(1)}</text>
              </g>
            ))}
            <rect x="174" y="28" width="54" height="56" rx="8" fill="#fff" stroke="#CBD5E1" />
            <text x="201" y="45" textAnchor="middle" fontSize="10" fill="#64748B">Target</text>
            <text x="201" y="66" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1E293B">{supTarget}</text>
            <rect x="236" y="28" width="46" height="56" rx="8" fill="#fff" stroke="#CBD5E1" />
            <text x="259" y="45" textAnchor="middle" fontSize="10" fill="#64748B">Pred</text>
            <motion.text key={sCalc.pred} x="259" y="66" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1E293B" initial={{ opacity: 0.5, y: 69 }} animate={{ opacity: 1, y: 66 }} transition={{ duration: 0.22 }}>{sCalc.pred}</motion.text>
            {supShowFeedback && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <rect x="18" y="100" width="264" height="26" rx="8" fill={sCalc.mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={sCalc.mismatch ? '#F59E0B' : '#22C55E'} />
                <text x="150" y="117" textAnchor="middle" fontSize="11" fontWeight="700" fill={sCalc.mismatch ? '#B45309' : '#166534'}>
                  {sCalc.mismatch ? 'Mismatch shown. Weights changed.' : 'Match. Weights stayed.'}
                </text>
              </motion.g>
            )}
          </svg>
          <div className="m3-controls">
            <button className="m3-btn" onClick={() => { setSupTarget(t => t === 1 ? 0 : 1); setSupShowFeedback(false); setSupChanged([false, false, false]) }}>Change Target</button>
            <button className="m3-btn" onClick={applySup}>Apply Feedback</button>
            <button className="m3-btn" onClick={() => { setSupWeights([1, 1, 1]); setSupTarget(1); setSupShowFeedback(false); setSupChanged([false, false, false]) }}>Reset</button>
          </div>
          <p className="m3-type-desc">Compare target vs prediction, then update.</p>
          <p className="m3-human-parallel"><em>Human parallel:</em> Like a teacher correcting your spelling — you get explicit right/wrong feedback.</p>
        </div>

        {/* Unsupervised */}
        <div className="m3-type-card">
          <div className="m3-type-title">Unsupervised</div>
          <svg viewBox="0 0 300 180" className="m3-svg-block">
            <rect x="6" y="6" width="288" height="168" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
            <rect x="18" y="20" width="264" height="140" rx="8" fill="#fff" stroke="#CBD5E1" />
            {unsupStage >= 1 && unsupStage < 2 && unsupPoints.map(p => {
              let n = null, m = Infinity
              unsupPoints.forEach(q => { if (q.id === p.id) return; const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (d < m) { m = d; n = q } })
              if (!n) return null
              return <line key={`n-${p.id}`} x1={28 + p.x * 240} y1={30 + p.y * 120} x2={28 + n.x * 240} y2={30 + n.y * 120} stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 3" />
            })}
            {unsupStage >= 2 && <><circle cx="98" cy="82" r="40" fill="none" stroke="#93C5FD" strokeDasharray="5 4" /><circle cx="214" cy="104" r="40" fill="none" stroke="#86EFAC" strokeDasharray="5 4" /></>}
            {unsupPoints.map(p => (
              <motion.circle key={p.id} cx={28 + p.x * 240} cy={30 + p.y * 120} r="9" fill={p.g === 'A' ? '#3B82F6' : p.g === 'B' ? '#16A34A' : '#94A3B8'} animate={{ cx: 28 + p.x * 240, cy: 30 + p.y * 120 }} transition={{ duration: 0.28 }} />
            ))}
          </svg>
          <div className="m3-controls">
            <button className="m3-btn" onClick={() => setUnsupStage(1)}>Show Similarity</button>
            <button className="m3-btn" onClick={() => {
              setUnsupStage(2)
              setUnsupPoints(pts => pts.map(v => {
                const g = v.x + v.y > 1.08 ? 'B' : 'A'
                const tx = g === 'A' ? 0.2 + (v.id % 2) * 0.06 : 0.67 + (v.id % 2) * 0.06
                const ty = g === 'A' ? 0.36 + (v.id % 3) * 0.07 : 0.5 + (v.id % 3) * 0.07
                return { ...v, g, x: tx, y: ty }
              }))
            }}>Find Groups</button>
            <button className="m3-btn" onClick={() => {
              setUnsupStage(0)
              setUnsupPoints([{ id: 1, x: 0.2, y: 0.3, g: null }, { id: 2, x: 0.28, y: 0.39, g: null }, { id: 3, x: 0.68, y: 0.72, g: null }, { id: 4, x: 0.62, y: 0.56, g: null }, { id: 5, x: 0.45, y: 0.58, g: null }])
            }}>Reset</button>
          </div>
          <p className="m3-type-desc">No targets. Similar points form groups.</p>
          <p className="m3-human-parallel"><em>Human parallel:</em> Like noticing you keep seeing the same faces at the coffee shop — no one told you they're regulars.</p>
        </div>

        {/* Reinforcement */}
        <div className="m3-type-card">
          <div className="m3-type-title">Reinforcement</div>
          <svg viewBox="0 0 300 180" className="m3-svg-block">
            <rect x="6" y="6" width="288" height="168" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
            {[0, 1, 2].map(c => <rect key={c} x={22 + c * 46} y="40" width="38" height="32" rx="8" fill={c === rlState ? '#DBEAFE' : '#fff'} stroke={c === rlState ? '#60A5FA' : '#CBD5E1'} />)}
            <motion.g key={`${rlLastAction}-${rlReward}`} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
              <rect x="170" y="32" width="112" height="38" rx="8" fill="#fff" stroke="#CBD5E1" />
              <text x="182" y="49" fontSize="10" fill="#64748B">Reward</text>
              <text x="182" y="63" fontSize="14" fontWeight="700" fill={rlReward === null ? '#64748B' : rlReward > 0 ? '#166534' : '#B91C1C'}>{rlReward === null ? '--' : rlReward.toFixed(1)}</text>
            </motion.g>
            {['left', 'up', 'right'].map((d, i) => (
              <g key={d} transform={`translate(${18 + i * 92},98)`}>
                <text x="0" y="0" fontSize="10" fill="#64748B">{d.toUpperCase()}</text>
                <rect x="0" y="8" width="74" height="10" rx="5" fill="#E2E8F0" />
                <motion.rect x="0" y="8" height="10" rx="5" fill={d === strongest ? '#2563EB' : d === 'left' ? '#60A5FA' : d === 'up' ? '#4ADE80' : '#FBBF24'} animate={{ width: (rlPrefs[d] / prefMax) * 74 }} transition={{ duration: 0.25 }} />
                {rlLastAction === d && <rect x="-3" y="5" width="80" height="16" rx="7" fill="none" stroke="#3B82F6" strokeWidth="1.4" />}
              </g>
            ))}
          </svg>
          <div className="m3-controls">
            <button className="m3-btn" onClick={() => act('left')}>Left</button>
            <button className="m3-btn" onClick={() => act('up')}>Up</button>
            <button className="m3-btn" onClick={() => act('right')}>Right</button>
            <button className="m3-btn" onClick={() => { setRlState(1); setRlPrefs({ left: 0.5, up: 0.5, right: 0.5 }); setRlReward(null); setRlLastAction(null) }}>Reset</button>
          </div>
          <p className="m3-type-desc">Reward shifts action preference.</p>
          <p className="m3-human-parallel"><em>Human parallel:</em> Like a toddler learning to walk — each tumble is feedback, each step forward is reward.</p>
        </div>
      </div>
    </section>
  )
}

export default LearningTypes
