import payAttentionSvg from '../../../assets/pay-attention-not-css.svg?raw'
import '../../../assets/pay-attention-styles.css'

const backgroundNoise = [
  { label: 'chat...', className: 'module1-attention-noise--top' },
  { label: 'murmur', className: 'module1-attention-noise--middle' },
  { label: 'noise', className: 'module1-attention-noise--bottom' },
  { label: '...', className: 'module1-attention-noise--soft' },
]

function HearingAttentionScene() {
  return (
    <figure className="module1-attention-figure">
      <div
        className="module1-attention-scene"
        role="img"
        aria-label="A person in a noisy room notices their name as the strongest sound reaches the listening side first."
      >
        <div
          className="module1-attention-scene__art"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: payAttentionSvg }}
        />

        <div className="module1-attention-noise-layer" aria-hidden="true">
          {backgroundNoise.map(({ label, className }) => (
            <span key={`${label}-${className}`} className={`module1-attention-noise ${className}`}>
              {label}
            </span>
          ))}
        </div>

        <div className="module1-attention-signal" aria-hidden="true">
          <div className="module1-attention-signal__word-track">
            <span className="module1-attention-signal__word">ALEX!</span>
          </div>
          <span className="module1-attention-signal__trail module1-attention-signal__trail--one" />
          <span className="module1-attention-signal__trail module1-attention-signal__trail--two" />
          <span className="module1-attention-signal__trail module1-attention-signal__trail--three" />
        </div>

        <div className="module1-attention-ear-focus" aria-hidden="true">
          <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--one" />
          <span className="module1-attention-ear-focus__ring module1-attention-ear-focus__ring--two" />
          <span className="module1-attention-ear-focus__dot" />
        </div>
      </div>

      <figcaption className="module1-attention-caption">
        In a noisy room, one meaningful sound can stand out.
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
