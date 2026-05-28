import { useState } from 'react'
import AnnDiagram from '../../../../components/diagrams/AnnDiagram'
import biologicalNeuronBridgeImage from '../../../../assets/ChatGPT Image Apr 24, 2026, 01_40_31 PM.png'

const MAPPING_STEPS = [
  {
    id: 'inputs',
    buttonLabel: 'Receives signals',
    highlightLabel: 'Signal in',
    bioTitle: 'Input branches',
    bioText: 'A biological neuron gathers incoming messages through its branching input region.',
    annTitle: 'Inputs',
    annText: 'An artificial neuron starts with input values that carry information into the model.',
    mappingText: 'Input branches (dendrites) map to the model inputs.',
    takeaway: 'Both systems begin by collecting incoming signals before anything is decided.',
  },
  {
    id: 'combine',
    buttonLabel: 'Adds them up',
    highlightLabel: 'Combine',
    bioTitle: 'Cell body',
    bioText: 'The cell body combines those signals and checks whether the total is strong enough.',
    annTitle: 'Processing rule',
    annText: 'The model combines its inputs, then uses an activation decision when the total passes the threshold.',
    mappingText: 'The soma or cell body maps to signal processing, and the firing threshold maps to the activation decision.',
    takeaway: 'This is the moment where both systems decide whether the evidence is strong enough to respond.',
  },
  {
    id: 'output',
    buttonLabel: 'Sends one output',
    highlightLabel: 'Signal out',
    bioTitle: 'Output path',
    bioText: 'Once the neuron fires, one signal travels down the long output pathway.',
    annTitle: 'Output signal',
    annText: 'After the unit responds, one output value moves forward to the next part of the network.',
    mappingText: 'The axon maps to the model output signal.',
    takeaway: 'A long biological pathway becomes one outgoing value in the simplified model.',
  },
  {
    id: 'connection',
    buttonLabel: 'Passes it on',
    highlightLabel: 'Next link',
    bioTitle: 'Handoff point',
    bioText: 'At the far end, the signal reaches the next cell through the terminal connection.',
    annTitle: 'Weighted link',
    annText: 'In AI, the outgoing connection carries a weight that changes how strongly the next unit is affected.',
    mappingText: 'The synapse or terminal connection maps to a weighted connection in the model.',
    takeaway: 'Biology passes signals across synapses, while AI passes values across weighted links.',
  },
]

function BridgeToAnn({ onContinue }) {
  const [activeStepId, setActiveStepId] = useState(MAPPING_STEPS[0].id)
  const activeStep = MAPPING_STEPS.find((step) => step.id === activeStepId) ?? MAPPING_STEPS[0]

  return (
    <section className="module1-section module1-bridge-section">
      <div className="module1-section-heading module1-bridge-heading">
        <p className="module1-eyebrow">D. Bridge</p>
        <h2>From a biological neuron to a simpler model</h2>
        <p>
          We are not copying biology part-for-part. We are keeping one useful idea: signals come in, they combine, and
          the unit responds if the total evidence is strong enough.
        </p>
      </div>

      <section className="module1-bridge-mapping-panel module1-panel module1-soft-panel">
        <div className="module1-bridge-mapping-header">
          <div>
            <p className="module1-bridge-footer-title">Step through the mapping</p>
          </div>
        </div>

        <div className="bridge-mapping-list" aria-label="Biological neuron to artificial neuron mapping steps">
          {MAPPING_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`bridge-mapping-btn${activeStep.id === step.id ? ' bridge-mapping-btn--active' : ''}`}
              onClick={() => setActiveStepId(step.id)}
              aria-pressed={activeStep.id === step.id}
            >
              <span className="bridge-mapping-btn__index">{index + 1}</span>
              <span className="bridge-mapping-btn__text">{step.buttonLabel}</span>
            </button>
          ))}
        </div>
      </section>

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
            <div className="module1-bridge-bio-stage">
              <img
                className="module1-bridge-bio-image"
                src={biologicalNeuronBridgeImage}
                alt="Biological neuron with many incoming signals combining before outgoing signals continue."
              />
              <div className="module1-bridge-bio-scrim" aria-hidden="true" />
              {MAPPING_STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`module1-bridge-bio-focus module1-bridge-bio-focus--${step.id}${activeStep.id === step.id ? ' is-active' : ''}`}
                  aria-hidden="true"
                >
                  <span className="module1-bridge-bio-tag">{step.highlightLabel}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="bridge-panel bridge-panel-ann module1-panel module1-soft-panel">
          <div className="module1-bridge-panel-header">
            <div>
              <h3 className="module1-panel-title">Artificial neuron</h3>
              <p className="module1-card-muted">
                A simpler model that keeps the same basic idea: inputs come in, combine, and produce one output.
              </p>
            </div>
            <span className="module1-bridge-current-label">Simplified model</span>
          </div>

          <div className="bridge-visual bridge-visual-ann module1-bridge-shell module1-bridge-shell-ann">
            <AnnDiagram variant="bridge" activeBridgePart={activeStep.id} />
          </div>

        </div>
      </section>

      <section className="module1-bridge-mapping-panel module1-panel module1-soft-panel" aria-live="polite">
        <div className="module1-bridge-mapping-header">
          <div>
            <p className="module1-bridge-footer-title">
              Step {MAPPING_STEPS.findIndex((step) => step.id === activeStep.id) + 1} of {MAPPING_STEPS.length}
            </p>
            <h3 className="module1-panel-title">{activeStep.buttonLabel}</h3>
          </div>
          <span className="module1-bridge-current-label">Current match</span>
        </div>

        <div className="module1-mapping-list-bridge">
          <article className="module1-mapping-item">
            <p className="module1-bridge-footer-title">Biological side</p>
            <h4>{activeStep.bioTitle}</h4>
            <p>{activeStep.bioText}</p>
          </article>

          <article className="module1-mapping-item">
            <p className="module1-bridge-footer-title">Artificial side</p>
            <h4>{activeStep.annTitle}</h4>
            <p>{activeStep.annText}</p>
          </article>
        </div>

        <p className="bridge-summary">{activeStep.takeaway}</p>
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
