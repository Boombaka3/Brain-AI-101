import React from 'react'
import { motion } from 'framer-motion'

function MiniCell({ value, active = false, success = false }) {
  const bg = success ? '#DCFCE7' : active ? '#DBEAFE' : '#F8FAFC'
  const border = success ? '#16A34A' : active ? '#3B82F6' : '#CBD5E1'
  const color = success ? '#166534' : active ? '#1E40AF' : '#475569'

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0.9 }}
      animate={{ scale: success ? 1.05 : active ? 1.02 : 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: `1px solid ${border}`,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        color,
      }}
    >
      {value}
    </motion.div>
  )
}

function Module3TransitionVisual({ isMobile = false, stage = 0 }) {
  const weightsBefore = [0.4, 0.7, 0.2, 0.6]
  const weightsAfter = [0.5, 0.8, 0.3, 0.6]
  const shownWeights = stage >= 3 ? weightsAfter : weightsBefore

  const prediction = stage >= 1 ? '0.62' : '--'
  const nextPrediction = stage >= 3 ? '0.74' : '--'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          padding: isMobile ? '12px' : '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Fixed Path (Module 2 rhythm)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Input</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '4px' }}>
                  {[1, 0, 1, 0, 1, 1, 1, 0, 1].map((value, idx) => (
                    <MiniCell key={`fixed-input-${idx}`} value={value} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '18px', color: '#94A3B8' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Weights</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gap: '6px' }}>
                  {weightsBefore.map((value, idx) => (
                    <MiniCell key={`fixed-weight-${idx}`} value={value.toFixed(1)} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '18px', color: '#94A3B8' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Output</div>
                <MiniCell value='0.62' active />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', backgroundColor: '#FFFFFF' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', marginBottom: '8px' }}>Adaptive Path (Module 3 loop)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Input</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '4px' }}>
                  {[1, 0, 1, 0, 1, 1, 1, 0, 1].map((value, idx) => (
                    <MiniCell key={`adaptive-input-${idx}`} value={value} active={stage >= 1} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '18px', color: '#3B82F6' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Weights</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gap: '6px' }}>
                  {shownWeights.map((value, idx) => (
                    <MiniCell key={`adaptive-weight-${idx}`} value={value.toFixed(1)} success={stage >= 3 && idx < 3} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '18px', color: '#3B82F6' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>Response</div>
                <MiniCell value={stage >= 3 ? nextPrediction : prediction} active={stage >= 1} success={stage >= 3} />
              </div>
            </div>

            <div style={{ marginTop: '10px', minHeight: '28px', display: 'flex', justifyContent: 'center' }}>
              {stage >= 2 && (
                <motion.div
                  key={`feedback-${stage}`}
                  initial={{ opacity: 0.6, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    fontSize: '11px',
                    color: '#1E40AF',
                    fontWeight: 600,
                  }}
                >
                  {'Target mismatch detected → send feedback → adjust weights'}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Module3TransitionVisual



