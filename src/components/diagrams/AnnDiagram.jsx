function AnnDiagram({ isMobile = false, variant = 'default', activeBridgePart = 'inputs' }) {
  const isBridge = variant === 'bridge'
  const width = isBridge || isMobile ? '100%' : 800
  const viewBox = isBridge ? '0 0 620 380' : '0 0 800 300'
  const ariaLabel = isBridge ? 'One neuron simplified model diagram' : 'Artificial neuron diagram'

  return (
    <div className={`ann-diagram-shell ${isBridge ? 'ann-diagram-shell--bridge' : ''}`}>
      <svg
        width={width}
        viewBox={viewBox}
        role="img"
        aria-label={ariaLabel}
        className="ann-diagram-svg"
        style={isBridge ? { maxHeight: '340px' } : undefined}
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
                <line x1="92" y1="98" x2="268" y2="190" stroke="#c7d2fe" strokeWidth="2" />
                <line x1="92" y1="190" x2="268" y2="190" stroke="#c7d2fe" strokeWidth="2" />
                <line x1="92" y1="282" x2="268" y2="190" stroke="#c7d2fe" strokeWidth="2" />

                <g>
                  <circle cx="64" cy="98" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="104" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">
                    x1
                  </text>
                </g>

                <g>
                  <circle cx="64" cy="190" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="196" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">
                    x2
                  </text>
                </g>

                <g>
                  <circle cx="64" cy="282" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
                  <text x="64" y="288" textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="700">
                    x3
                  </text>
                </g>
              </g>

              <g className={`bridge-ann__node${activeBridgePart === 'combine' ? ' bridge-part--active' : ''}`}>
                <circle cx="320" cy="190" r="40" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="3" />
                <text x="320" y="198" textAnchor="middle" fontSize="18" fill="#6d28d9" fontWeight="700">
                  n
                </text>
              </g>

              <g className={`bridge-ann__output${activeBridgePart === 'output' ? ' bridge-part--active' : ''}`}>
                <line
                  x1="360"
                  y1="190"
                  x2="496"
                  y2="190"
                  stroke="#c7d2fe"
                  strokeWidth="2.4"
                  markerEnd="url(#ann-bridge-arrow)"
                />
                <text x="428" y="166" textAnchor="middle" fontSize="14" fill="#4b5563" fontWeight="700">
                  output
                </text>
              </g>

              <g className={`bridge-ann__connection${activeBridgePart === 'connection' ? ' bridge-part--active' : ''}`}>
                <line x1="496" y1="190" x2="564" y2="190" stroke="#99aeca" strokeWidth="2.1" />
                <circle cx="584" cy="190" r="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.4" />
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
