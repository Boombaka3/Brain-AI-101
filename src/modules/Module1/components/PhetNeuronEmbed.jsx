import { useState } from 'react'

const LIVE_NEURON_URL = 'https://phet.colorado.edu/sims/html/neuron/latest/neuron_en.html'
const BASE_URL = import.meta.env.BASE_URL || '/'

function withBase(path) {
  const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${normalizedPath}`
}

const DEFAULT_SHELL_URL = withBase('vendor/phet/neuron/aiweb-neuron-shell.html')
const DEFAULT_LOCAL_URL = withBase('vendor/phet/neuron/neuron_en_adapted-from-phet.html')

export const PHET_NEURON_REPO_URL = 'https://github.com/phetsims/neuron'
export const PHET_NEURON_LIVE_URL = LIVE_NEURON_URL
export const PHET_NEURON_SIM_URL = import.meta.env.VITE_PHET_NEURON_URL || DEFAULT_SHELL_URL
export const PHET_NEURON_LOCAL_BUILD_URL = DEFAULT_LOCAL_URL

function PhetNeuronEmbed({ iframeRef = null, onFrameLoad = null }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="module1-phet-embed">
      {isLoading && (
        <div className="module1-phet-embed__loading">
          <span className="module1-phet-embed__loading-dot" aria-hidden="true" />
          Loading the PhET neuron simulator…
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="module1-phet-embed__frame"
        src={PHET_NEURON_SIM_URL}
        title="PhET Neuron simulation"
        loading="lazy"
        allow="fullscreen"
        onLoad={() => {
          setIsLoading(false)
          onFrameLoad?.()
        }}
      />
    </div>
  )
}

export default PhetNeuronEmbed
