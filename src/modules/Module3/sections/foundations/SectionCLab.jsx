import TrainingLab from './TrainingLab'

function SectionCLab() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. ERROR GOES DOWN OVER TIME</p>
        <h2>Watching a Model Learn</h2>
        <p className="m3-section-subtitle">
          Each round, the model guesses, checks its error, and adjusts its weights.
          After enough rounds, the error gets small.
        </p>
      </div>
      <TrainingLab />
    </section>
  )
}

export default SectionCLab
