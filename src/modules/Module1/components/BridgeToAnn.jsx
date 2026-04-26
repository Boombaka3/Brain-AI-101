import AnnDiagram from '../../../components/diagrams/AnnDiagram'
import CleanNeuronSvg from './CleanNeuronSvg'

const BRIDGE_MAPPINGS = [
  {
    biology: 'Dendrites gather many incoming signals.',
    artificial: 'Inputs bring separate values into the model.',
  },
  {
    biology: 'The soma combines what arrives.',
    artificial: 'A weighted sum in one unit combines the pattern.',
  },
  {
    biology: 'A strong enough signal continues down the neuron.',
    artificial: 'An activation rule decides whether one output moves forward.',
  },
]

function BridgeToAnn({ onContinue }) {
  return (
    <section className="module1-section module1-bridge-section">
      <div className="module1-section-heading module1-bridge-heading">
        <p className="module1-eyebrow">D. Bridge</p>
        <h2>From a living neuron to a simpler model</h2>
        <p>
          We are not copying biology part-for-part. We are keeping one useful idea: signals come in, they combine, and
          the unit responds if the total evidence is strong enough.
        </p>
      </div>

      <section className="bridge-comparison module1-bridge-comparison">
        <div className="bridge-panel bridge-panel-bio module1-panel module1-soft-panel">
          <div className="module1-bridge-panel-header">
            <div>
              <h3 className="module1-panel-title module1-panel-title-large">Biological neuron</h3>
              <p className="module1-card-muted">
                A living cell whose parts gather, combine, and pass signals onward.
              </p>
            </div>
            <span className="module1-bridge-current-label">Real system</span>
          </div>

          <div className="bridge-visual bridge-visual-bio module1-bridge-shell module1-bridge-shell-bio">
            <CleanNeuronSvg
              className="module1-bridge-bio-art"
              level={1}
              fillPercent={48}
              showInputSignals={true}
              showThreshold={true}
              showLabels={false}
              isFiring={false}
            />
          </div>

          <p className="module1-card-muted module1-bridge-panel-note">
            The picture still looks biological, but this section is about function: many inputs converge on one cell
            body before one outgoing signal continues.
          </p>
        </div>

        <div className="bridge-panel bridge-panel-ann module1-panel module1-soft-panel">
          <div className="module1-bridge-panel-header">
            <div>
              <h3 className="module1-panel-title">Artificial neuron</h3>
              <p className="module1-card-muted">
                The same visual logic you meet in Module 2, brought back here as a simpler bridge.
              </p>
            </div>
            <span className="module1-bridge-current-label">Simplified model</span>
          </div>

          <div className="bridge-visual bridge-visual-ann module1-bridge-shell module1-bridge-shell-ann">
            <AnnDiagram variant="bridge" />
          </div>

          <p className="module1-card-muted module1-bridge-panel-note">
            This is no longer a generic ANN icon. It uses the Module 2 pattern-to-neuron visual so the bridge feels
            like a true handoff into the next lesson.
          </p>
        </div>
      </section>

      <section className="module1-panel module1-soft-panel module1-bridge-mapping-panel">
        <div className="module1-bridge-mapping-header">
          <div>
            <p className="module1-eyebrow module1-eyebrow-tight">Quick Mapping</p>
            <h3 className="module1-panel-title">Two versions of one idea</h3>
          </div>
          <p className="module1-card-muted">
            This is the move into Module 2: keep the logic, simplify the structure.
          </p>
        </div>

        <div className="module1-mapping-list-bridge">
          {BRIDGE_MAPPINGS.map((item) => (
            <article key={item.biology} className="module1-mapping-item">
              <p className="module1-bridge-footer-title">Biological</p>
              <p>{item.biology}</p>
              <span className="module1-mapping-arrow">-&gt;</span>
              <p className="module1-mapping-target">{item.artificial}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="module1-bridge-actions">
        <button className="module1-primary-button" onClick={onContinue}>
          Continue to Module 2
        </button>
      </div>
    </section>
  )
}

export default BridgeToAnn
