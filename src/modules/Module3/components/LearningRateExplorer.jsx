import { useState } from 'react'
import '../module3.css'

const PRESETS = [
  {
    id: 'low',
    label: 'Too Low',
    lr: 0.001,
    desc: 'Learns very slowly — barely descends',
    color: '#F59E0B',
    // SVG path for a near-flat curve
    path: 'M 10,14 C 40,13.5 80,12.8 140,11.5 C 200,10.5 240,9.8 290,9',
  },
  {
    id: 'good',
    label: 'Just Right',
    lr: 0.05,
    desc: 'Smooth descent to a low loss',
    color: '#10B981',
    path: 'M 10,14 C 40,12 70,9 100,7 C 140,5 190,3.5 290,2.5',
  },
  {
    id: 'high',
    label: 'Too High',
    lr: 1.0,
    desc: 'Overshoots — oscillates and diverges',
    color: '#EF4444',
    path: 'M 10,14 C 25,3 40,14 55,5 C 70,1 85,13 100,6 C 120,2 140,12 160,7 C 180,3 210,11 250,8 C 270,6 280,9 290,7',
  },
]

export default function LearningRateExplorer() {
  const [selected, setSelected] = useState('good')
  const [lr, setLr] = useState(0.05)

  const active = PRESETS.find((p) => p.id === selected) || PRESETS[1]

  return (
    <div className="module3-lr-wrap">
      {/* Car braking analogy */}
      <div className="module3-car-braking">
        <p className="module3-braking-label">Think of it like braking in a car</p>
        <div className="module3-braking-row">
          <div className="module3-braking-card module3-braking-card--slow">
            <div className="module3-braking-emoji">🐢</div>
            <p className="module3-braking-title">Too Low</p>
            <p className="module3-braking-desc">Feather-light taps. You'll stop eventually — but it takes forever.</p>
          </div>
          <div className="module3-braking-card module3-braking-card--right">
            <div className="module3-braking-emoji">🚗</div>
            <p className="module3-braking-title">Just Right</p>
            <p className="module3-braking-desc">Firm, smooth pressure. You slow down at the right rate.</p>
          </div>
          <div className="module3-braking-card module3-braking-card--fast">
            <div className="module3-braking-emoji">💥</div>
            <p className="module3-braking-title">Too High</p>
            <p className="module3-braking-desc">Slam the brakes. You skid, overshoot, and fishtail.</p>
          </div>
        </div>
      </div>

      <p className="module3-loss-chart-label">Learning rate explorer</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
          LR: <span style={{ color: '#2563eb', fontFamily: 'monospace' }}>{lr}</span>
        </label>
        <input
          type="range"
          min={0.001}
          max={1.0}
          step={0.001}
          value={lr}
          onChange={(e) => {
            const v = Number(e.target.value)
            setLr(v)
            if (v < 0.01) setSelected('low')
            else if (v > 0.3) setSelected('high')
            else setSelected('good')
          }}
          style={{ flex: 1, minWidth: 120, maxWidth: 200, accentColor: '#2563eb' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`shared-btn shared-btn-sm ${selected === p.id ? 'shared-btn-primary' : 'shared-btn-ghost'}`}
              onClick={() => { setSelected(p.id); setLr(p.lr) }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="module3-lr-curves">
        {PRESETS.map((p) => (
          <div
            key={p.id}
            className={`module3-lr-curve-card${selected === p.id ? ' selected' : ''}`}
            onClick={() => { setSelected(p.id); setLr(p.lr) }}
            style={{ cursor: 'pointer', borderColor: selected === p.id ? p.color : undefined }}
          >
            <svg width="100%" viewBox="0 0 300 20" style={{ display: 'block', overflow: 'visible' }}>
              <path d={p.path} stroke={p.color} strokeWidth={selected === p.id ? 2.5 : 1.5} fill="none" strokeLinecap="round" />
            </svg>
            <p style={{ color: p.color }}>{p.label}</p>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.desc}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '10px 14px', marginTop: 14, fontFamily: 'monospace', fontSize: 13,
        color: '#334155',
      }}>
        w = w − <span style={{ color: '#2563eb', fontWeight: 700 }}>{lr}</span> × error
      </div>
    </div>
  )
}
