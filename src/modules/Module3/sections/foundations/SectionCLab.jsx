import TrainingLab from './TrainingLab'

function SectionCLab() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. ERROR GOES DOWN OVER TIME</p>
        <h2>Train a Toy Model</h2>
        <p className="m3-section-subtitle">
          A model usually does not improve in one step. It trains by making a prediction, checking the error, and adjusting its weights again and again.
        </p>
      </div>

      <TrainingLab />
    </section>
  )
}

export default SectionCLab
