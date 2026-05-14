import TrainingLab from './TrainingLab'

function SectionCLab() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">C. ERROR GOES DOWN OVER TIME</p>
        <h2>What happens when the model trains repeatedly?</h2>
        <p className="m3-section-subtitle">
          Training repeats the correction loop. Each epoch gives the model another chance to reduce
          error.
        </p>
      </div>

      <div className="m3-section-card m3-training-intro-card">
        <p>One correction can improve one prediction.</p>
        <p>Training means repeating the correction process.</p>
        <p>
          An epoch is one complete training round. During each epoch, the model makes a prediction,
          compares it with the target, measures error, and updates weights.
        </p>
        <p>If the updates move in the right direction, error decreases over time.</p>
      </div>

      <TrainingLab />
    </section>
  )
}

export default SectionCLab
