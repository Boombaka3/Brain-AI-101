const CNN_EXPLAINER_DEMO_URL = 'https://poloclub.github.io/cnn-explainer/'
const CNN_EXPLAINER_REPO_URL = 'https://github.com/poloclub/cnn-explainer'

function CnnExplainerSection() {
  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">E. CNN Explainer</p>
        <h2>See How a CNN Reads an Image</h2>
        <p className="m2-section-subtitle">
          This interactive explainer makes convolution, feature maps, and pooling feel less abstract by letting you trace what the network is doing layer by layer.
        </p>
      </div>

      <div className="m2-section-card m2-explainer-card">
        <div className="m2-explainer-intro">
          <p><strong>Try this flow:</strong> start with the input image, follow one filter, then watch how later layers care less about raw pixels and more about bigger visual patterns.</p>
          <p>Notice how pooling trims detail while keeping the strongest signals alive. That tradeoff is what lets CNNs become more selective as they go deeper.</p>
        </div>

        <iframe
          src={CNN_EXPLAINER_DEMO_URL}
          title="CNN Explainer"
          className="m2-explainer-iframe"
          allowFullScreen
        />

        <p className="m2-explainer-fallback-note">
          If the embed doesn&apos;t load:{' '}
          <a href={CNN_EXPLAINER_DEMO_URL} target="_blank" rel="noopener noreferrer">
            Open CNN Explainer →
          </a>
        </p>

        <div className="m2-explainer-prompts">
          <strong>Good things to look for:</strong> which edge patterns light up first, how pooling reduces resolution, and how later layers combine simple parts into more recognizable features.
        </div>

        <p className="m2-source-note">
          Source and attribution:{' '}
          <a href={CNN_EXPLAINER_REPO_URL} target="_blank" rel="noopener noreferrer">
            poloclub/cnn-explainer on GitHub
          </a>
        </p>
      </div>
    </section>
  )
}

export default CnnExplainerSection
