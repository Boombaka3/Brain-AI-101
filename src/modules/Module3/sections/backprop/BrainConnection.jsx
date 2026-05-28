import { useEffect, useRef, useState } from 'react'

const NEUROCORRELATION_ARTICLE_URL = 'https://axelwickman.com/articles/neurocorrelation?utm_source=gh_neurocorrelation'
const NEUROCORRELATION_EMBED_URL = `${NEUROCORRELATION_ARTICLE_URL}#:~:text=Live%20App`
const LOCAL_NEUROCORRELATION_MODULE_PATH = `${import.meta.env.BASE_URL}vendor/neurocorrelation/index.mjs`
const NEUROCORRELATION_REPO_URL = 'https://github.com/Axelwickm/NeuroCorrelation'

const FEEDBACK_POINTS = [
  {
    title: 'Brain-style feedback',
    body: 'Instead of sending a global error backward, nearby neurons strengthen or weaken their link from local spike timing.',
  },
  {
    title: 'Why it matters',
    body: 'This makes learning feel more biological: the update comes from what two connected neurons just did together.',
  },
  {
    title: 'AI connection',
    body: 'Both systems still change weights from feedback. The main difference is where the teaching signal comes from.',
  },
]

function NeuroCorrelationPreview() {
  const canvasRef = useRef(null)
  const viewerRef = useRef(null)
  const mountedAppRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const [availability, setAvailability] = useState('checking')
  const [state, setState] = useState('idle')

  useEffect(() => {
    let cancelled = false

    const checkLocalBuild = async () => {
      try {
        const response = await fetch(LOCAL_NEUROCORRELATION_MODULE_PATH, {
          cache: 'no-store',
        })

        if (cancelled) return

        if (!response.ok) {
          setAvailability('live')
          setState('embedded-live')
          return
        }

        const contentType = response.headers.get('content-type') || ''
        const body = await response.text()
        const looksLikeModule = contentType.includes('javascript')
          || contentType.includes('ecmascript')
          || LOCAL_NEUROCORRELATION_MODULE_PATH.endsWith('.mjs')

        if (looksLikeModule && body.includes('mountNeuroCorrelation')) {
          setAvailability('local')
          return
        }

        setAvailability('live')
        setState('embedded-live')
      } catch (error) {
        if (cancelled) return
        console.error('NeuroCorrelation local availability check failed:', error)
        setAvailability('live')
        setState('embedded-live')
      }
    }

    checkLocalBuild()

    return () => {
      cancelled = true
      resizeObserverRef.current?.disconnect()
      mountedAppRef.current?.destroy?.()
    }
  }, [])

  const syncCanvasSize = () => {
    const canvas = canvasRef.current
    const viewer = viewerRef.current
    if (!canvas || !viewer) return

    const width = viewer.clientWidth
    const height = viewer.clientHeight
    if (width === 0 || height === 0) return

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
  }

  const handleStart = async () => {
    if (state === 'starting' || state === 'ready' || state === 'embedded-live') return

    if (availability !== 'local') {
      setState('embedded-live')
      return
    }

    try {
      setState('starting')

      const module = await import(/* @vite-ignore */ LOCAL_NEUROCORRELATION_MODULE_PATH)
      const mountNeuroCorrelation = module.default || module.mountNeuroCorrelation

      if (typeof mountNeuroCorrelation !== 'function') {
        throw new Error('Local NeuroCorrelation module does not export a mount function.')
      }

      syncCanvasSize()

      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = new ResizeObserver(syncCanvasSize)
      if (viewerRef.current) {
        resizeObserverRef.current.observe(viewerRef.current)
      }

      mountedAppRef.current?.destroy?.()
      mountedAppRef.current = await mountNeuroCorrelation({
        canvas: canvasRef.current,
        preset: 'STANDARD',
        print: (text) => console.log(text),
        printErr: (text) => console.error(text),
      })

      setState('ready')
    } catch (error) {
      console.error('NeuroCorrelation local mount failed:', error)
      setAvailability('live')
      setState('idle')
    }
  }

  const showCanvas = state === 'ready'
  const showLiveFrame = state === 'embedded-live'
  const description = availability === 'local'
    ? 'A local browser build was detected, so this preview can start directly inside Module 3.'
    : 'The live NeuroCorrelation app is embedded below so you can explore the simulation without leaving Module 3.'
  const buttonCopy = 'Launch the local NeuroCorrelation simulation in this page.'

  return (
    <div className="m3-brain-feedback__viewer" ref={viewerRef}>
      <canvas
        ref={canvasRef}
        className={`m3-brain-feedback__canvas${showCanvas ? ' is-active' : ''}`}
        aria-label="NeuroCorrelation simulation canvas"
      />

      {showLiveFrame ? (
        <div className="m3-brain-feedback__frame-shell">
          <div className="m3-brain-feedback__frame-note">
            <strong>Live article loaded in place</strong>
            <span>Use the embedded NeuroCorrelation Start App button inside the frame to begin the 3D simulation.</span>
          </div>
          <iframe
            className="m3-brain-feedback__frame"
            src={NEUROCORRELATION_EMBED_URL}
            title="Embedded NeuroCorrelation live article and simulation"
            loading="lazy"
            allow="autoplay; clipboard-write; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}

      {!showCanvas && !showLiveFrame ? (
        <div className="m3-brain-feedback__fallback" aria-label="NeuroCorrelation preview unavailable">
          <p className="m3-brain-feedback__fallback-tag">Simulation preview</p>
          <h4>{availability === 'checking' ? 'Preparing the preview' : 'Interactive simulation ready to launch'}</h4>
          <p>{availability === 'checking' ? 'Checking how this simulation can be launched on this machine.' : description}</p>
          <ul className="m3-brain-feedback__fallback-list">
            <li>Neurons that fire together strengthen their connection over time.</li>
            <li>Uncorrelated activity weakens those links.</li>
            <li>This gives a more biological contrast to backpropagation in AI.</li>
          </ul>

        </div>
      ) : null}

      <div className="m3-brain-feedback__control-dock">
        {availability === 'local' ? (
          <button
            type="button"
            className="m3-brain-feedback__launch"
            onClick={handleStart}
            disabled={state === 'starting' || state === 'ready'}
          >
            <span className="m3-brain-feedback__launch-label">
              {state === 'starting' ? 'Starting…' : 'Start Local App'}
            </span>
            <span className="m3-brain-feedback__launch-copy">{buttonCopy}</span>
          </button>
        ) : availability === 'checking' ? (
          <div className="m3-brain-feedback__launch is-static">
            <span className="m3-brain-feedback__launch-label">Checking app mode</span>
            <span className="m3-brain-feedback__launch-copy">Looking for a local browser build before enabling the section controls.</span>
          </div>
        ) : null}

        <a
          className="m3-btn"
          href={NEUROCORRELATION_ARTICLE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open Full Article
        </a>
      </div>
    </div>
  )
}

function BrainConnection() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">E. BRAIN × AI FEEDBACK</p>
        <h2>NeuroCorrelation: A More Brain-Like Feedback Loop</h2>
        <p className="m3-section-subtitle">
          Backprop uses error to update weights. Spiking brain models can also update weights, but from local timing between neurons.
        </p>
      </div>

      <div className="m3-section-card m3-brain-feedback">
        <div className="m3-brain-feedback__layout">
          <div className="m3-brain-feedback__copy">
            <div className="m3-brain-feedback__intro">
              <p className="m3-brain-feedback__label">What to notice</p>
              <h3>Same idea: feedback changes connections. Different rule: timing instead of loss.</h3>
              <p>
                This simulation adds a more biological flavor to Module 3. Watch how activity patterns and correlated firing can reshape
                connections without using the classic backpropagation pipeline.
              </p>
            </div>

            <div className="m3-brain-feedback__points">
              {FEEDBACK_POINTS.map((point) => (
                <article key={point.title} className="m3-brain-feedback__point">
                  <h4>{point.title}</h4>
                  <p>{point.body}</p>
                </article>
              ))}
            </div>

            <div className="m3-brain-feedback__compare">
              <div className="m3-brain-feedback__compare-card">
                <p className="m3-brain-feedback__mini-label">AI model</p>
                <strong>Weights change from prediction error</strong>
                <span>Useful when the model knows the target and can measure how wrong it was.</span>
              </div>

              <div className="m3-brain-feedback__compare-card">
                <p className="m3-brain-feedback__mini-label">Brain-inspired model</p>
                <strong>Weights change from correlated activity</strong>
                <span>Useful for showing how local neuron interactions can teach the network on their own.</span>
              </div>
            </div>
          </div>

          <div className="m3-brain-feedback__visual">
            <div className="m3-brain-feedback__shell">
              <div className="m3-brain-feedback__shell-bar">
                <span />
                <span />
                <span />
                <p>NeuroCorrelation 3D preview</p>
              </div>

              <NeuroCorrelationPreview />
            </div>

            <p className="m3-brain-feedback__note">
              Source attribution restored: <a href={NEUROCORRELATION_REPO_URL} target="_blank" rel="noreferrer">Axelwickm/NeuroCorrelation</a> by Axel Wickman.
            </p>
            <p className="m3-source-note">
              A local browser bundle is now hosted inside this app. The original live article remains available as a reference and attribution path.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrainConnection
