import './downstreamCallout.css'

export default function DownstreamCallout({ scenario, isVisible }) {
  if (!scenario) return null

  return (
    <div className={`downstream-callout${isVisible ? ' downstream-callout--visible' : ''}`} aria-live="polite">
      <span className="downstream-callout__emoji" aria-hidden="true">{scenario.emoji}</span>
      <div className="downstream-callout__body">
        <p className="downstream-callout__action">{scenario.downstreamAction}</p>
        <span className="downstream-callout__time">{scenario.reactionTime}</span>
      </div>
    </div>
  )
}
