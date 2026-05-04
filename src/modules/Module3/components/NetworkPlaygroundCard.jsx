const TF_PLAYGROUND_URL = 'https://playground.tensorflow.org/'

function NetworkPlaygroundCard() {
  return (
    <div className="m3-section-card m3-playground-card">
      <div className="m3-playground-heading">
        <p className="m3-rl-control-label">Supervised learning</p>
        <h3>See Supervised Learning in Action</h3>
        <p className="m3-type-desc">
          Here the model does get an answer key. Try the live playground and watch how changing the network changes the line between right and wrong guesses.
        </p>
      </div>

      <iframe
        src={TF_PLAYGROUND_URL}
        title="TensorFlow Playground"
        className="m3-playground-iframe"
        allowFullScreen
      />

      <p className="m3-playground-fallback-note">
        If the embed doesn&apos;t load:{' '}
        <a href={TF_PLAYGROUND_URL} target="_blank" rel="noopener noreferrer">
          Open TensorFlow Playground →
        </a>
      </p>

      <div className="m3-playground-tips">
        <strong>Try this:</strong> Add hidden layers and watch the boundary bend. Switch between ReLU and Tanh. Add noise, then add neurons, and see how the model tries to recover.
      </div>
    </div>
  )
}

export default NetworkPlaygroundCard
