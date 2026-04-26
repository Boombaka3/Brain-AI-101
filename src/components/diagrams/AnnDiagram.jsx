function AnnDiagram({ isMobile = false, variant = 'default' }) {
  const width = isMobile ? '100%' : 800
  const isBridge = variant === 'bridge'

  return (
    <div className={`ann-diagram-shell ${isBridge ? 'ann-diagram-shell--bridge' : ''}`}>
      <svg width={width} viewBox="0 0 800 300" role="img" aria-label="Artificial neuron diagram" className="ann-diagram-svg">
        <rect x="0" y="0" width="800" height="300" rx="18" fill="#F8FAFC" />

        {isBridge ? (
          <>
            <g className="ann-diagram__bridge-grid" aria-hidden="true">
              <rect x="86" y="74" width="44" height="44" rx="8" />
              <rect x="136" y="74" width="44" height="44" rx="8" />
              <rect x="186" y="74" width="44" height="44" rx="8" />

              <rect x="86" y="126" width="44" height="44" rx="8" />
              <rect x="136" y="126" width="44" height="44" rx="8" />
              <rect x="186" y="126" width="44" height="44" rx="8" />

              <rect x="86" y="178" width="44" height="44" rx="8" />
              <rect x="136" y="178" width="44" height="44" rx="8" />
              <rect x="186" y="178" width="44" height="44" rx="8" />

              <text x="108" y="101">1</text>
              <text x="158" y="101">0</text>
              <text x="208" y="101">1</text>
              <text x="108" y="153">1</text>
              <text x="158" y="153">0</text>
              <text x="208" y="153">1</text>
              <text x="108" y="205">1</text>
              <text x="158" y="205">0</text>
              <text x="208" y="205">1</text>
            </g>

            <g className="ann-diagram__bridge-connections" aria-hidden="true">
              <path d="M 230 96 Q 314 92, 374 122" />
              <path d="M 230 148 Q 320 146, 372 140" />
              <path d="M 230 200 Q 316 206, 374 158" />
            </g>

            <g className="ann-diagram__weight-tags" aria-hidden="true">
              <text x="294" y="104">w</text>
              <text x="304" y="154">w</text>
              <text x="294" y="206">w</text>
            </g>

            <g className="ann-diagram__bridge-node">
              <circle cx="440" cy="148" r="62" />
              <circle cx="440" cy="148" r="44" />
              <text x="440" y="154" textAnchor="middle">
                Σ
              </text>
            </g>

            <g className="ann-diagram__activation-cue" aria-hidden="true">
              <path d="M 504 148 L 556 148" />
              <circle cx="600" cy="148" r="24" />
              <text x="600" y="155" textAnchor="middle">
                1
              </text>
            </g>

            <g className="ann-diagram__labels">
              <text x="160" y="52" textAnchor="middle">input pattern</text>
              <text x="440" y="58" textAnchor="middle">weighted sum</text>
              <text x="600" y="58" textAnchor="middle">output</text>
              <text x="440" y="238" textAnchor="middle">same logic as Module 2</text>
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
