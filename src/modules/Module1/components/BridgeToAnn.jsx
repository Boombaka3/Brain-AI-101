import AnnDiagram from '../../../components/diagrams/AnnDiagram'
import CleanNeuronSvg from './CleanNeuronSvg'

function BridgeToAnn({ onContinue }) {
  return (
    <section className="module1-section module1-bridge-section">
      <div className="module1-section-heading module1-bridge-heading">
        <p className="module1-eyebrow">C. Bridge</p>
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

      <div className="module1-bridge-actions">
        <button className="module1-primary-button" onClick={onContinue}>
          Continue to Module 2
        </button>
      </div>
    </section>
  )
}

export default BridgeToAnn
