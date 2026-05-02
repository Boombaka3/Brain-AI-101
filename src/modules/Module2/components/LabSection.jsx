const TF_PLAYGROUND_URL = 'https://playground.tensorflow.org/'

export default function LabSection() {
  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">E. Lab</p>
        <h2>Tinker with a Real Network</h2>
        <p className="m2-section-subtitle">
          You&apos;ve built the intuition — weights, activation, dropout, convolution. Now try it on a live network.
        </p>
      </div>

      <div className="m2-section-card">
        <iframe
          src={TF_PLAYGROUND_URL}
          title="TensorFlow Playground"
          className="m2-lab-iframe"
          allowFullScreen
        />

        <p className="m2-lab-fallback-note">
          If the embed doesn&apos;t load:{' '}
          <a href={TF_PLAYGROUND_URL} target="_blank" rel="noopener noreferrer">
            Open TensorFlow Playground →
          </a>
        </p>

        <div className="m2-lab-tips">
          <strong>Try this:</strong> Add hidden layers and watch the decision boundary change. Switch the activation function between ReLU and Tanh. Turn up the noise and see how the network struggles — then add more neurons.
        </div>
      </div>
    </section>
  )
}
