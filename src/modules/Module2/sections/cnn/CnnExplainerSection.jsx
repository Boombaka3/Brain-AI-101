import { useState } from 'react'

const CNN_EXPLAINER_DEMO_URL = 'https://poloclub.github.io/cnn-explainer/'
const CNN_EXPLAINER_REPO_URL = 'https://github.com/poloclub/cnn-explainer'

function CnnExplainerSection() {
  const [flowOpen, setFlowOpen] = useState(true)

  return (
    <section className="m2-section">
      <div className="m2-section-card m2-explainer-card">
        <div className="m2-section-heading m2-canvas-heading">
          <p className="m2-eyebrow">E. CNN Explainer</p>
          <h2>See How a CNN Reads an Image</h2>
          <p className="m2-section-subtitle">
            This interactive explainer makes convolution, feature maps,
            and pooling feel less abstract by letting you trace what
            the network is doing layer by layer.
          </p>
        </div>

        <div className="m2-explainer-linkout">
          <div className="m2-explainer-linkout__body">
            <p className="m2-explainer-linkout__tag">Interactive tool</p>
            <h3 className="m2-explainer-linkout__title">
              CNN Explainer opens in its own tab
            </h3>
            <p className="m2-explainer-linkout__desc">
              Built by the Polo Club at Georgia Tech. Upload an image,
              pick a filter, and watch activations propagate layer by layer
              through a real trained network.
            </p>
          </div>

          <a
            href={CNN_EXPLAINER_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="m2-explainer-linkout__btn"
          >
            Open CNN Explainer ↗
          </a>
        </div>

        <div className="m2-explainer-intro">
          <button
            className="m2-explainer-intro__toggle"
            onClick={() => setFlowOpen(o => !o)}
            aria-expanded={flowOpen}
          >
            <span>Try this flow</span>
            <span className={`m2-explainer-intro__chevron${flowOpen ? ' m2-explainer-intro__chevron--open' : ''}`}>▾</span>
          </button>
          {flowOpen && (
            <div className="m2-explainer-intro__body">
              <p>
                Start with the input image, follow one filter, then watch
                how later layers care less about raw pixels and more about
                bigger visual patterns.
              </p>
              <p>
                Notice how pooling trims detail while keeping the strongest
                signals alive. That tradeoff is what lets CNNs become more
                selective as they go deeper.
              </p>
            </div>
          )}
        </div>

        <p className="m2-source-note">
          Source:{' '}
          <a
            href={CNN_EXPLAINER_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            poloclub/cnn-explainer on GitHub
          </a>
        </p>
      </div>
    </section>
  )
}

export default CnnExplainerSection
