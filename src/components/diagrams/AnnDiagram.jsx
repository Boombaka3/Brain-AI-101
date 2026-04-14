function AnnDiagram({ isMobile = false }) {
  const width = isMobile ? '100%' : 800

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '12px',
      }}
    >
      <svg width={width} viewBox="0 0 800 300" role="img" aria-label="Artificial neuron diagram" style={{ display: 'block', width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width="800" height="300" rx="18" fill="#F8FAFC" />

        <g stroke="#94A3B8" strokeWidth="4" strokeLinecap="round">
          <line x1="90" y1="90" x2="280" y2="128" />
          <line x1="90" y1="145" x2="280" y2="145" />
          <line x1="90" y1="200" x2="280" y2="162" />
          <line x1="90" y1="255" x2="280" y2="179" />
        </g>

        <g>
          <circle cx="380" cy="153" r="74" fill="#FFFFFF" stroke="#2563EB" strokeWidth="5" />
          <text x="380" y="165" textAnchor="middle" fontSize="40" fontWeight="700" fill="#1D4ED8">
            Σ
          </text>
        </g>

        <g stroke="#94A3B8" strokeWidth="4" strokeLinecap="round">
          <line x1="454" y1="153" x2="690" y2="153" />
        </g>

        <g fill="#64748B" fontSize="16" fontWeight="600">
          <text x="120" y="62">inputs</text>
          <text x="380" y="58" textAnchor="middle">summation</text>
          <text x="694" y="136" textAnchor="end">output</text>
        </g>
      </svg>
    </div>
  )
}

export default AnnDiagram
