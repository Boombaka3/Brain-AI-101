import { useMemo, useRef } from 'react'
import { useNeuronAnimation } from '../../../hooks/useNeuronAnimation'
import './biologyDiagram.css'
import neuronDiagramAsset from '../../../assets/vector-diagram-of-neuron-anatomy.svg'

const VIEWBOX = '0 0 980 560'
const DENDRITES = [
  'M 226 232 C 203 205 181 180 156 149 C 138 127 119 104 97 82',
  'M 194 279 C 157 266 119 249 81 223 C 63 210 45 197 30 182',
  'M 207 342 C 173 357 142 377 112 402 C 94 418 80 435 66 451',
  'M 266 381 C 248 412 230 442 208 468 C 194 485 178 500 162 514',
]
const AXON_PATH = 'M 438 308 C 492 298 548 296 611 304 C 695 314 772 335 865 380'
const TERMINAL_PATHS = [
  'M 866 380 C 894 384 919 370 944 344',
  'M 866 380 C 902 386 931 398 960 420',
  'M 866 380 C 890 395 914 420 940 452',
]
const BOUTONS = [
  { cx: 947, cy: 341, r: 10 },
  { cx: 964, cy: 423, r: 10 },
  { cx: 943, cy: 456, r: 9 },
]

const SIGNAL_INPUT_POSITIONS = [
  { cx: 98, cy: 84 },
  { cx: 30, cy: 182 },
  { cx: 66, cy: 451 },
  { cx: 162, cy: 514 },
]

function getSomaFillMetrics(totalInput, threshold) {
  const clampedRatio = Math.max(0, Math.min(totalInput / Math.max(threshold, 1), 1.35))
  const minHeight = 18
  const maxHeight = 150
  const height = minHeight + (maxHeight - minHeight) * Math.min(clampedRatio, 1)
  const y = 355 - height
  return { y, height }
}

function StaticReferenceDiagram({ width }) {
  return (
    <figure className="biology-diagram">
      <div className="biology-diagram__frame">
        <img
          className="biology-diagram__image"
          src={neuronDiagramAsset}
          alt="Biological neuron anatomy diagram"
          width={width}
          loading="eager"
          decoding="async"
        />
        <figcaption className="biology-diagram__credit">
          <a href="https://www.vecteezy.com/free-vector/neuron" target="_blank" rel="noreferrer">
            Neuron Vectors by Vecteezy
          </a>
        </figcaption>
      </div>
    </figure>
  )
}

function InteractiveBiologyDiagram({
  width,
  weightedInputs,
  totalInput,
  threshold,
  didFire,
  currentPhase,
  replaySignal,
  onPhaseChange,
}) {
  const dendritePathRefs = useRef([])
  const inputPulseRefs = useRef([])
  const somaFillRef = useRef(null)
  const somaFillLineRef = useRef(null)
  const somaGlowRef = useRef(null)
  const thresholdRingRef = useRef(null)
  const axonPathRef = useRef(null)
  const axonPulseRef = useRef(null)
  const terminalBranchRefs = useRef([])
  const boutonRefs = useRef([])

  const somaMetrics = useMemo(() => getSomaFillMetrics(totalInput, threshold), [totalInput, threshold])

  useNeuronAnimation({
    weightedInputs,
    totalInput,
    threshold,
    didFire,
    replaySignal,
    currentPhase,
    dendritePathRefs,
    inputPulseRefs,
    somaFillRef,
    somaFillLineRef,
    somaGlowRef,
    thresholdRingRef,
    axonPathRef,
    axonPulseRef,
    terminalBranchRefs,
    boutonRefs,
    onPhaseChange,
    restingSomaY: 347,
    restingSomaHeight: 18,
    activeSomaY: somaMetrics.y,
    activeSomaHeight: somaMetrics.height,
  })

  return (
    <figure className="biology-diagram biology-diagram--interactive">
      <div className="biology-diagram__frame biology-diagram__frame--interactive">
        <svg
          className="biology-diagram__svg"
          viewBox={VIEWBOX}
          width={width}
          role="img"
          aria-label="Animated biological neuron showing signals entering through dendrites, building in the soma, crossing threshold, and moving down the axon"
        >
          <defs>
            <linearGradient id="bio-soma-base" x1="178" y1="190" x2="398" y2="392" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8b1b5" />
              <stop offset="100%" stopColor="#cb6267" />
            </linearGradient>
            <linearGradient id="bio-soma-fill" x1="240" y1="230" x2="360" y2="388" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <clipPath id="bio-soma-clip">
              <path d="M 341 212 C 305 176 246 170 203 197 C 164 221 149 274 166 320 C 184 370 235 406 294 402 C 342 398 383 372 403 333 C 421 297 419 252 394 227 C 379 212 362 206 341 212 Z" />
            </clipPath>
          </defs>

          <rect className="biology-diagram__panel-bg" x="0" y="0" width="980" height="560" rx="28" />

          <g className="biology-diagram__dendrites" data-part="dendrites">
            {DENDRITES.map((d, index) => (
              <path
                key={d}
                ref={(node) => {
                  dendritePathRefs.current[index] = node
                }}
                d={d}
                className="biology-diagram__dendrite"
              />
            ))}
          </g>

          <g className="biology-diagram__soma" data-part="soma">
            <path
              d="M 341 212 C 305 176 246 170 203 197 C 164 221 149 274 166 320 C 184 370 235 406 294 402 C 342 398 383 372 403 333 C 421 297 419 252 394 227 C 379 212 362 206 341 212 Z"
              className="biology-diagram__soma-shell"
            />
            <rect
              ref={somaFillRef}
              x="155"
              y="347"
              width="270"
              height="18"
              clipPath="url(#bio-soma-clip)"
              className="biology-diagram__soma-fill"
            />
            <line
              ref={somaFillLineRef}
              x1="185"
              x2="388"
              y1="347"
              y2="347"
              className="biology-diagram__soma-fill-line"
              clipPath="url(#bio-soma-clip)"
            />
            <path
              ref={somaGlowRef}
              d="M 305 224 C 272 201 227 205 199 232 C 173 259 171 305 191 336 C 216 375 263 389 314 378 C 352 370 382 344 392 309 C 400 280 392 247 369 229 C 351 215 330 213 305 224 Z"
              className="biology-diagram__soma-glow"
            />
          </g>

          <g className="biology-diagram__nucleus" data-part="nucleus">
            <path
              d="M 288 242 C 259 244 236 262 229 288 C 221 319 240 347 272 355 C 305 362 339 345 349 315 C 359 286 342 252 312 244 C 304 242 296 241 288 242 Z"
              className="biology-diagram__nucleus-shell"
            />
            <circle cx="289" cy="301" r="16" className="biology-diagram__nucleolus" />
          </g>

          <g className="biology-diagram__threshold" data-part="threshold">
            <circle ref={thresholdRingRef} cx="290" cy="289" r="68" className="biology-diagram__threshold-ring" />
          </g>

          <g className="biology-diagram__hillock" data-part="hillock">
            <path
              d="M 374 274 C 392 266 417 266 438 276 C 454 283 464 295 464 308 C 464 322 453 334 435 341 C 412 349 386 346 367 334 C 356 326 349 315 350 303 C 351 290 359 281 374 274 Z"
              className="biology-diagram__hillock-shape"
            />
          </g>

          <g className="biology-diagram__axon" data-part="axon">
            <path ref={axonPathRef} d={AXON_PATH} className="biology-diagram__axon-path" />
          </g>

          <g className="biology-diagram__terminal" data-part="terminal">
            {TERMINAL_PATHS.map((d, index) => (
              <path
                key={d}
                ref={(node) => {
                  terminalBranchRefs.current[index] = node
                }}
                d={d}
                className="biology-diagram__terminal-branch"
              />
            ))}
          </g>

          <g className="biology-diagram__boutons" data-part="boutons">
            {BOUTONS.map((bouton, index) => (
              <circle
                key={`${bouton.cx}-${bouton.cy}`}
                ref={(node) => {
                  boutonRefs.current[index] = node
                }}
                cx={bouton.cx}
                cy={bouton.cy}
                r={bouton.r}
                className="biology-diagram__bouton"
              />
            ))}
          </g>

          <g className="biology-diagram__signals" data-part="signals">
            {SIGNAL_INPUT_POSITIONS.map((position, index) => (
              <circle
                key={`${position.cx}-${position.cy}`}
                ref={(node) => {
                  inputPulseRefs.current[index] = node
                }}
                cx={position.cx}
                cy={position.cy}
                r="7"
                className="biology-diagram__signal-pulse"
              />
            ))}
            <circle ref={axonPulseRef} cx="438" cy="308" r="8" className="biology-diagram__signal-pulse" />
          </g>
        </svg>
      </div>
    </figure>
  )
}

function BiologyDiagram({
  isMobile = false,
  mode = 'static',
  weightedInputs = [0, 0, 0, 0],
  totalInput = 0,
  threshold = 6,
  didFire = false,
  currentPhase = 'idle',
  replaySignal = 0,
  onPhaseChange,
}) {
  const width = isMobile ? '100%' : 920

  if (mode === 'interactive') {
    return (
      <InteractiveBiologyDiagram
        width={width}
        weightedInputs={weightedInputs}
        totalInput={totalInput}
        threshold={threshold}
        didFire={didFire}
        currentPhase={currentPhase}
        replaySignal={replaySignal}
        onPhaseChange={onPhaseChange}
      />
    )
  }

  return <StaticReferenceDiagram width={width} />
}

export default BiologyDiagram
