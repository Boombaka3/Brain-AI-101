import hubelWieselImage from '../../../../assets/module2/selectivity/hubel-wiesel-selectivity.png'

export default function HubelWieselStory() {
  return (
    <article className="m2-hw-card">
      <div className="m2-hw-copy">
        <h3>Hubel & Wiesel's Cat Experiment</h3>
        <p>
          Hubel and Wiesel recorded from neurons in a cat's visual cortex while showing simple bars of light at different angles. They found that one neuron did not respond equally to every line. It fired most strongly when the line appeared at a preferred angle.
        </p>
        <p>
          That is selectivity: a neuron can respond more strongly to one kind of visual feature than another.
        </p>
      </div>

      <figure className="m2-hw-figure">
        <img
          src={hubelWieselImage}
          alt="Diagram of a cat visual cortex experiment showing a light bar stimulus, visual cortex recording, and stronger response to one preferred line angle."
          loading="eager"
        />
        <figcaption>
          One visual cortex neuron can respond strongly to one edge direction and weakly to others.
          {' '}Source:{' '}
          <a href="https://doi.org/10.3390/brainsci12040470" target="_blank" rel="noreferrer">
            Li, Todo, and Tang (Brain Sciences, 2022)
          </a>
        </figcaption>
      </figure>
    </article>
  )
}
