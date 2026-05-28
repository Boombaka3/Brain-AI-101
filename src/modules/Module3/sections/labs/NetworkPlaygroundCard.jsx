const BASE_URL = import.meta.env.BASE_URL || '/'
const TF_PLAYGROUND_URL = `${BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`}vendor/tensorflow-playground/index.html`
const TF_PLAYGROUND_REPO_URL = 'https://github.com/tensorflow/playground'

function NetworkPlaygroundCard() {
  return (
    <div className="m3-playground-card">
      <div className="m3-playground-heading">
        <p className="m3-rl-control-label">Supervised learning</p>
        <p className="m3-type-desc">
          Use the TensorFlow Playground to see how labeled answers reshape a model&apos;s decision boundary.
        </p>
      </div>

      <iframe
        src={TF_PLAYGROUND_URL}
        title="TensorFlow Playground"
        className="m3-playground-iframe"
        allowFullScreen
        scrolling="no"
      />

      <p className="m3-playground-fallback-note">
        If the embed doesn&apos;t load:{' '}
        <a href={TF_PLAYGROUND_REPO_URL} target="_blank" rel="noopener noreferrer">
          {'Open the Playground source ->'}
        </a>
      </p>

      <div className="m3-playground-tips">
        <strong>Try this:</strong> Add hidden layers, switch activation functions, and change the dataset noise to watch supervised feedback bend the boundary.
      </div>

      <p className="m3-source-note">
        Source repo:{' '}
        <a href={TF_PLAYGROUND_REPO_URL} target="_blank" rel="noopener noreferrer">
          tensorflow/playground on GitHub
        </a>
      </p>
    </div>
  )
}

export default NetworkPlaygroundCard
