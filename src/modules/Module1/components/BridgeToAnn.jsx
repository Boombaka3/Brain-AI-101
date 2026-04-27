import { useState } from 'react'

const MAPPINGS = [
  {
    id: 'dendrites',
    label: 'Dendrites → Inputs',
    bioParts: ['dendrites'],
    annParts: ['inputs'],
  },
  {
    id: 'soma',
    label: 'Soma → Summation',
    bioParts: ['soma', 'nucleus', 'hillock'],
    annParts: ['node'],
  },
  {
    id: 'axon',
    label: 'Axon → Output',
    bioParts: ['axon', 'terminal'],
    annParts: ['output'],
  },
]

function BridgeToAnn({ onContinue }) {
  const [activeMapping, setActiveMapping] = useState(null)

  const activeBio = activeMapping
    ? MAPPINGS.find((m) => m.id === activeMapping)?.bioParts ?? []
    : []
  const activeAnn = activeMapping
    ? MAPPINGS.find((m) => m.id === activeMapping)?.annParts ?? []
    : []

  const bioClass = (part) =>
    activeMapping && activeBio.includes(part) ? ' bridge-part--active' : ''
  const annClass = (part) =>
    activeMapping && activeAnn.includes(part) ? ' bridge-part--active' : ''

  const svgMod = activeMapping ? ' bridge-svg--has-highlight' : ''

  return (
    <section className="module1-section module1-bridge-section">
      <div className="module1-section-heading module1-bridge-heading">
        <p className="module1-eyebrow">D. Bridge</p>
        <h2>From biology to algorithm</h2>
        <p>
          Click a mapping below to highlight how each biological part
          corresponds to its artificial counterpart.
        </p>
      </div>

      <div className="bridge-mapping-list">
        {MAPPINGS.map((m) => (
          <button
            key={m.id}
            className={`bridge-mapping-btn${activeMapping === m.id ? ' bridge-mapping-btn--active' : ''}`}
            onClick={() => setActiveMapping(activeMapping === m.id ? null : m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section className="bridge-comparison module1-bridge-comparison">
        <div className="bridge-panel bridge-panel-bio module1-panel module1-soft-panel">
          <h3 className="module1-panel-title module1-panel-title-large">Biological neuron</h3>
          <p className="module1-card-muted">A real cell with parts that carry and combine signals.</p>
          <div className="bridge-visual bridge-visual-bio">
            <svg
              className={`bridge-svg${svgMod}`}
              viewBox="0 0 860 420"
              role="img"
              aria-label="Biological neuron diagram"
            >
              <g data-part="dendrites" className={`bridge-bio__dendrites${bioClass('dendrites')}`}>
                <path d="M 140 140 C 200 170, 250 200, 290 235" />
                <path d="M 180 160 C 160 140, 150 120, 140 100" />
                <path d="M 200 175 C 180 185, 160 200, 140 215" />
                <path d="M 150 210 C 220 225, 260 240, 290 255" />
                <path d="M 190 225 C 170 235, 150 250, 135 270" />
                <path d="M 140 290 C 220 275, 260 270, 290 265" />
                <path d="M 180 280 C 160 290, 145 310, 135 330" />
                <path d="M 150 360 C 210 320, 260 300, 300 285" />
                <path d="M 190 330 C 170 350, 155 370, 145 395" />
              </g>

              <g data-part="soma" className={`bridge-bio__soma${bioClass('soma')}`}>
                <path d="M 280 250 C 270 220, 300 200, 340 210 C 380 220, 400 250, 390 285 C 375 320, 330 330, 300 305 C 270 285, 265 265, 280 250 Z" />
              </g>

              <g data-part="nucleus" className={`bridge-bio__nucleus${bioClass('nucleus')}`}>
                <ellipse cx="330" cy="265" rx="14" ry="11" />
                <circle cx="335" cy="265" r="4" />
              </g>

              <g data-part="hillock" className={`bridge-bio__hillock${bioClass('hillock')}`}>
                <path d="M 390 250 C 410 245, 420 255, 420 265 C 420 275, 410 285, 390 280 Z" />
              </g>

              <g data-part="axon" className={`bridge-bio__axon${bioClass('axon')}`}>
                <path d="M 420 265 C 520 255, 600 260, 680 270" />
              </g>

              <g data-part="terminal" className={`bridge-bio__terminal${bioClass('terminal')}`}>
                <path d="M 700 270 C 730 250, 760 235, 800 220" />
                <path d="M 700 270 C 740 270, 770 270, 810 270" />
                <path d="M 700 270 C 730 290, 760 305, 800 320" />
                <circle cx="805" cy="220" r="6" />
                <circle cx="815" cy="270" r="5" />
                <circle cx="800" cy="320" r="6.5" />
              </g>

              <g className="bridge-bio__labels" aria-hidden="true">
                <text x="150" y="86">dendrites</text>
                <text x="297" y="196">soma</text>
                <text x="320" y="260">nucleus</text>
                <text x="515" y="240">axon</text>
                <text x="705" y="198">terminal branches</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="bridge-panel bridge-panel-ann module1-panel module1-soft-panel">
          <h3 className="module1-panel-title">Artificial neuron</h3>
          <p className="module1-card-muted">A simplified model built from the same basic logic.</p>
          <div className="bridge-visual bridge-visual-ann">
            <svg
              className={`bridge-svg${svgMod}`}
              viewBox="520 150 360 220"
              role="img"
              aria-label="Artificial neuron diagram"
            >
              <g className={`bridge-ann__inputs${annClass('inputs')}`}>
                <line x1="580" y1="200" x2="645" y2="235" />
                <line x1="580" y1="235" x2="645" y2="250" />
                <line x1="580" y1="285" x2="645" y2="270" />
                <line x1="580" y1="320" x2="645" y2="285" />
              </g>

              <g className={`bridge-ann__node${annClass('node')}`}>
                <circle cx="700" cy="260" r="55" />
                <text x="700" y="265" textAnchor="middle">Σ</text>
              </g>

              <g className={`bridge-ann__output${annClass('output')}`}>
                <line x1="755" y1="260" x2="840" y2="260" />
              </g>

              <g className="bridge-ann__labels" aria-hidden="true">
                <text x="604" y="185">inputs</text>
                <text x="700" y="190" textAnchor="middle">summation</text>
                <text x="840" y="245" textAnchor="end">output</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <div className="bridge-summary">
        An artificial neuron is the same idea, minus the biology: <strong>inputs × weights → sum → threshold → output</strong>.
      </div>

      <div className="module1-bridge-actions">
        <button className="module1-primary-button" onClick={onContinue}>
          Continue to Module 2
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginLeft: 6 }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default BridgeToAnn
