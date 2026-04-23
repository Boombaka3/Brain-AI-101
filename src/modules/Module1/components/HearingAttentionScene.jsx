import { useState } from 'react'
import payAttentionSvg from '../../../assets/pay-attention-not-css.svg?raw'
import eyesSvg from '../../../assets/eyes-not-css.svg?raw'
import '../../../assets/pay-attention-styles.css'
import '../../../assets/eyes-styles.css'

const backgroundNoise = [
  { label: 'chat...', className: 'module1-attention-noise--top' },
  { label: 'murmur', className: 'module1-attention-noise--middle' },
  { label: 'noise', className: 'module1-attention-noise--bottom' },
  { label: '...', className: 'module1-attention-noise--soft' },
]

function HearingAttentionScene() {
  const [showEyeScene, setShowEyeScene] = useState(false)

  return (
    <figure className="module1-attention-figure">
      <button
        type="button"
        className={`module1-scene-flipcard${showEyeScene ? ' is-flipped' : ''}`}
        onClick={() => setShowEyeScene((current) => !current)}
        aria-pressed={showEyeScene}
        aria-label={
          showEyeScene
            ? 'Show the hearing attention scene again'
            : 'Flip the card to show the bright light eye scene'
        }
      >
        <span className="module1-scene-flipcard__inner">
          <span className="module1-scene-flipcard__face module1-scene-flipcard__face--front">
            <span
              className="module1-attention-scene"
              role="img"
              aria-label="A person in a noisy room notices their name as the strongest sound reaches the listening side first."
            >
              <span
                className="module1-attention-scene__art"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: payAttentionSvg }}
              />

              <span className="module1-attention-noise-layer" aria-hidden="true">
                {backgroundNoise.map(({ label, className }) => (
                  <span key={`${label}-${className}`} className={`module1-attention-noise ${className}`}>
                    {label}
                  </span>
                ))}
              </span>

              <span className="module1-attention-signal" aria-hidden="true">
                <span className="module1-attention-signal__word-track">
                  <span className="module1-attention-signal__word">ALEX!</span>
                </span>
                <span className="module1-attention-signal__trail module1-attention-signal__trail--one" />
                <span className="module1-attention-signal__trail module1-attention-signal__trail--two" />
                <span className="module1-attention-signal__trail module1-attention-signal__trail--three" />
              </span>

              <span className="module1-attention-ear-focus" aria-hidden="true">
                <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--one" />
                <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--two" />
                <span className="module1-attention-ear-focus__dot" />
              </span>
            </span>
          </span>

          <span className="module1-scene-flipcard__face module1-scene-flipcard__face--back">
            <span
              className="module1-eye-scene"
              role="img"
              aria-label="Bright light reaches the eye from one side."
            >
              <span
                className="module1-eye-scene__art"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: eyesSvg }}
              />

              <span className="module1-eye-light-layer" aria-hidden="true">
                <span className="module1-eye-light-layer__source" />
                <span className="module1-eye-light-layer__beam" />
                <span className="module1-eye-light-layer__glow" />
              </span>
            </span>
          </span>
        </span>
      </button>

      <figcaption className="module1-attention-caption">
        {showEyeScene
          ? 'Bright light reaches the eye from one side.'
          : 'In a noisy room, one meaningful sound can stand out.'}
      </figcaption>
      <p className="module1-attention-attribution">
        <a href="https://storyset.com/people" target="_blank" rel="noreferrer">
          People illustrations by Storyset
        </a>
      </p>
    </figure>
  )
}

export default HearingAttentionScene
