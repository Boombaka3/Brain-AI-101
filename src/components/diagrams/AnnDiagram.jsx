function AnnDiagram({ isMobile = false, variant = 'default', activeBridgePart = 'inputs' }) {
  const isBridge = variant === 'bridge'
  const width = isBridge || isMobile ? '100%' : 800
  const viewBox = isBridge ? '0 0 620 360' : '0 0 800 300'
  const ariaLabel = isBridge ? 'One neuron simplified model diagram' : 'Artificial neuron diagram'

  return (
    <div className={`ann-diagram-shell ${isBridge ? 'ann-diagram-shell--bridge' : ''}`}>
      <svg
        width={width}
        viewBox={viewBox}
        role="img"
        aria-label={ariaLabel}
        className="ann-diagram-svg"
        style={isBridge ? { maxHeight: '300px' } : undefined}
      >
        {!isBridge && <rect x="0" y="0" width="800" height="300" rx="18" fill="#F8FAFC" />}

        {isBridge ? (
          <>
            <defs>
              <marker
                id="ann-bridge-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c7d2fe" />
              </marker>
            </defs>

            <g className={activeBridgePart ? 'bridge-svg--has-highlight' : ''} opacity="1">
              <g className={`bridge-ann__inputs${activeBridgePart === 'inputs' ? ' bridge-part--active' : ''}`}>
                <line x1="78" y1="110" x2="280" y2="200" stroke="#c7d2fe" strokeWidth="1.5" />
                <line x1="78" y1="200" x2="280" y2="200" stroke="#c7d2fe" strokeWidth="1.5" />
                <line x1="78" y1="290" x2="280" y2="200" stroke="#c7d2fe" strokeWidth="1.5" />

                <g>
                  <circle cx="60" cy="110" r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                  <text x="60" y="115" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">
                    x1
                  </text>
                </g>

                <g>
                  <circle cx="60" cy="200" r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                  <text x="60" y="205" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">
                    x2
                  </text>
                </g>

                <g>
                  <circle cx="60" cy="290" r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                  <text x="60" y="295" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">
                    x3
                  </text>
                </g>

                <text x="122" y="76" fontSize="12" fill="#64748b" fontWeight="700">
                  inputs
                </text>
              </g>

              <g className={`bridge-ann__node${activeBridgePart === 'combine' ? ' bridge-part--active' : ''}`}>
                <circle cx="310" cy="200" r="30" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="2.5" />
                <path
                  d="M 327 165 C 342 182, 342 218, 327 235"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="310" y="205" textAnchor="middle" fontSize="13" fill="#6d28d9" fontWeight="700">
                  N
                </text>
                <text x="285" y="150" fontSize="11" fill="#b45309" fontWeight="700">
                  threshold
                </text>
              </g>

              <g className={`bridge-ann__output${activeBridgePart === 'output' ? ' bridge-part--active' : ''}`}>
                <line
                  x1="340"
                  y1="200"
                  x2="424"
                  y2="200"
                  stroke="#c7d2fe"
                  strokeWidth="1.5"
                  markerEnd="url(#ann-bridge-arrow)"
                />
                <text x="382" y="182" textAnchor="middle" fontSize="12" fill="#4b5563" fontWeight="700">
                  output
                </text>
              </g>

              <g className={`bridge-ann__connection${activeBridgePart === 'connection' ? ' bridge-part--active' : ''}`}>
                <circle cx="456" cy="200" r="16" fill="#ecfeff" stroke="#0891b2" strokeWidth="2" />
                <text x="456" y="205" textAnchor="middle" fontSize="12" fill="#0f766e" fontWeight="700">
                  w
                </text>
                <line x1="472" y1="200" x2="524" y2="200" stroke="#99aeca" strokeWidth="1.8" />
                <circle cx="548" cy="200" r="18" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                <text x="548" y="205" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="700">
                  next
                </text>
                <text x="486" y="178" textAnchor="middle" fontSize="11" fill="#0f766e" fontWeight="700">
                  weight
                </text>
              </g>
            </g>
          </>
        ) : (
          <>
            <g className="ann-diagram__wires">
              <line x1="90" y1="90" x2="280" y2="128" />
              <line x1="90" y1="145" x2="280" y2="145" />
              <line x1="90" y1="200" x2="280" y2="162" />
              <line x1="90" y1="255" x2="280" y2="179" />
            </g>

            <g className="ann-diagram__node">
              <circle cx="380" cy="153" r="74" />
              <text x="380" y="165" textAnchor="middle">
                Σ
              </text>
            </g>

            <g className="ann-diagram__wires">
              <line x1="454" y1="153" x2="690" y2="153" />
            </g>

            <g className="ann-diagram__labels">
              <text x="120" y="62">inputs</text>
              <text x="380" y="58" textAnchor="middle">
                summation
              </text>
              <text x="694" y="136" textAnchor="end">
                output
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}

export default AnnDiagram
