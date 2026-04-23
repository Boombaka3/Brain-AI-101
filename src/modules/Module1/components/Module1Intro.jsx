import HearingAttentionScene from './HearingAttentionScene'

function Module1Intro({ onStart }) {
  return (
    <section className="module1-intro-hero">
      <div className="module1-intro-hero-inner">
        <p className="module1-intro-kicker">Module 1</p>
        <h2 className="module1-intro-headline">
          Meet a Neuron
          <br />
          <span className="module1-intro-headline-accent">In Action</span>
        </h2>
        <p className="module1-intro-desc">
          Explore how a single biological neuron receives signals through its
          dendrites, sums them in the soma, and decides whether to fire — the
          fundamental unit of every thought you've ever had.
        </p>
        <div className="module1-intro-stats">
          <div className="module1-intro-stat">
            <span className="module1-intro-stat-num">4</span>
            <span className="module1-intro-stat-label">Dendrite Paths</span>
          </div>
          <div className="module1-intro-stat-divider" />
          <div className="module1-intro-stat">
            <span className="module1-intro-stat-num">1</span>
            <span className="module1-intro-stat-label">Soma Decision</span>
          </div>
          <div className="module1-intro-stat-divider" />
          <div className="module1-intro-stat">
            <span className="module1-intro-stat-num">
              ~35
              <span className="module1-intro-stat-unit">ms</span>
            </span>
            <span className="module1-intro-stat-label">Reaction Time</span>
          </div>
        </div>
        <button className="module1-intro-cta" onClick={onStart}>
          Start exploring
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="module1-intro-orb" aria-hidden="true" />
    </section>
  )
}

export default Module1Intro
