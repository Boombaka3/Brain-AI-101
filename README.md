# Brain × AI 101

Brain × AI 101 is an interactive educational website built with React and Vite. It is designed as a K–12-facing reference and teaching tool for showing how biological neurons relate to artificial neural networks and how learning changes a system over time.

The current site teaches a three-part learning arc:

- Module 1: Students examine how biological neurons receive signals, combine inputs, reach threshold, and fire.
- Module 2: Students examine how artificial neurons, weights, layers, filters, and CNNs recognize patterns.
- Module 3: Students examine how feedback, error correction, backpropagation, and changing connections support learning.

## Website Flow

Current app flow from [src/App.jsx](src/App.jsx):

1. Landing Page
2. Module 1
3. Module 2
4. Module 3
5. Course Evaluation
6. Completion Screen

Notes:

- The app uses local React state with `currentView` and `goTo(view)`.
- The app does not use React Router.
- The landing page can start at Module 1 or navigate directly to Modules 1 to 3.
- Module 1, Module 2, and Module 3 each use the shared left-panel navigation component in `src/components/ui/ModuleNav.jsx`.

## Module Reference

### Module 1 — Biological Neuron

Learning goal:

- Students examine how biological neurons receive signals, combine inputs, reach threshold, and fire.

Sections:

- Introduction
- Neuron Anatomy
- Sound Experiment
- Bridge to AI

Key terms:

- selective attention
- dendrites
- soma
- axon
- terminals
- threshold
- signal
- fire

Main interactions:

- Flip-card scene comparing a noisy-room hearing example with a bright-light eye example
- Guided hotspot anatomy sequence with ordered neuron-part reveals
- Sound input experiment with typed or preset phrases
- Soma input meter with threshold marker
- Embedded neuron simulation with manual stimulation, reset, speed controls, and optional advanced view settings
- Step-through biological-neuron to artificial-neuron mapping buttons

Visuals/simulations:

- Hearing-attention scene with background noise and highlighted name cue
- Guided neuron anatomy image with close-up panel
- Animated floating sound signals moving toward the soma
- Soma threshold meter
- Embedded PhET neuron simulation
- Biological neuron bridge image
- Artificial neuron SVG diagram

Teacher demonstration notes:

- Use the hearing-your-name example to introduce selective attention.
- Reveal the neuron parts in order: dendrites, soma, axon, terminals.
- In the sound experiment, compare a weaker sound with a stronger or more meaningful sound and point to the threshold line.
- Show that threshold crossing now triggers the same firing behavior as the manual neuron stimulation control.
- In the bridge section, step through the mapping between biological and artificial systems one part at a time.

Student takeaway:

- A biological neuron receives input, combines signals, and fires only when the total passes threshold.

### Module 2 — Pattern Recognition

Learning goal:

- Students examine how artificial neurons, weights, layers, filters, and CNNs recognize patterns.

Sections:

- Neural Networks
- Activation Functions
- Neural Selectivity
- CNNs
- CNN Explainer

Key terms:

- artificial neuron
- input layer
- hidden layer
- output layer
- activation function
- ReLU
- Sigmoid
- selectivity
- weights
- filters
- kernel
- padding
- stride
- CNN

Main interactions:

- Staged neural-network build from one neuron to deeper layers
- Activation-function slider for ReLU and Sigmoid
- Selectivity grid with clickable cells, presets, and neuron silencing
- CNN scanning lab with editable image cells, editable filter values, output-map clicks, filter presets, and score breakdown
- Embedded CNN Explainer iframe

Visuals/simulations:

- Artificial neural network SVG diagrams
- Activation-function graph panels
- Hubel and Wiesel experiment card with image
- Pattern-selectivity neuron display with response bars
- CNN scan diagram showing original image, padded image, filter, and output
- External CNN Explainer embed

Teacher demonstration notes:

- Step through the network growth from one neuron to a deeper network.
- Move the activation slider across negative and positive values to compare ReLU and Sigmoid outputs.
- In the selectivity section, load a pattern preset and compare neuron responses before opening the "Show why" panel.
- In the CNN section, move the active filter window and show how filter values change the output score.
- Use the CNN Explainer embed as a guided visual reference rather than a required core interaction.

Student takeaway:

- Artificial neurons and CNNs use weighted pattern detection to respond to edges, shapes, and larger visual features.

### Module 3 — Learning to Learn

Learning goal:

- Students examine how feedback, error correction, backpropagation, and changing connections support learning.

Sections:

- Fixed vs Learning
- Three Ways to Learn
- Learning in Action
- Backpropagation
- Big Picture

Key terms:

- prediction
- target
- error
- weight update
- supervised learning
- unsupervised learning
- reinforcement learning
- reward
- consequence
- backpropagation
- forward pass
- backward pass

Main interactions:

- Step-through learning example that reveals prediction, target, error, and weight updates
- Three learning-type comparison cards
- K-means clustering lab with point placement, cluster count, run/pause, step, and reset controls
- Embedded TensorFlow Playground for supervised learning
- Reinforcement-learning grid with editable board, algorithm toggles, and parameter sliders
- Backpropagation sequence controls
- Deep-network stage buttons in the final bridge

Visuals/simulations:

- Handwritten digit learning example with confidence and weight bars
- Learning-type comparison cards
- K-means clustering plot with centroids and assignment lines
- Embedded TensorFlow Playground
- Reinforcement-learning grid world with robot token, reward toasts, and action values
- Backpropagation network diagram with forward and backward animated paths
- Deep-network layer diagram

Teacher demonstration notes:

- In the first section, step through the prediction-to-error-to-weight-update sequence in order.
- Use the three learning cards to compare the type of feedback each system receives.
- In the learning lab section, demonstrate one action in each of the three sub-labs rather than trying to exhaust every control.
- In the reinforcement section, compare Q-Learning and SARSA on the same board state.
- Use the backpropagation section to show that error is traced backward so weights can change.
- Use the final deep-network bridge as a recap of how a single-neuron idea scales into layered systems.

Student takeaway:

- Learning changes future behavior by adjusting connections after feedback, error, or consequences.

## Interaction Reference

The site contains the following major student-facing interaction patterns.

| Module | Section | Interaction | What the student does | What changes on screen | Concept demonstrated |
| --- | --- | --- | --- | --- | --- |
| Landing | Landing Page | Module entry buttons | Click module buttons or start button | Scrolls within landing or opens a module | Course structure and entry flow |
| Module 1 | Introduction | Flip-card scene | Click the scene card | Scene flips between hearing and eye/light examples | Selective attention and meaningful signals |
| Module 1 | Neuron Anatomy | Guided hotspots | Click neuron hotspots in order | Highlight, description, and close-up image update | Neuron-part roles |
| Module 1 | Sound Experiment | Sound input activity | Type or pick a phrase, then send it | Signals animate, soma meter changes, result panel updates | Threshold and firing |
| Module 1 | Sound Experiment | Embedded neuron controls | Stimulate, reset, change speed, open view options | Simulation responds | Neuron firing behavior |
| Module 1 | Bridge to AI | Mapping buttons | Click step buttons | Biological and artificial diagrams update | Biology-to-AI mapping |
| Module 2 | Neural Networks | Stage buttons | Advance through layers | Network diagram grows | One neuron vs layered network |
| Module 2 | Activation Functions | Input slider | Move slider | Graph dots and outputs update | Activation response |
| Module 2 | Neural Selectivity | Grid and presets | Toggle cells or load patterns | Neuron responses and match panels update | Weighted selectivity |
| Module 2 | CNNs | CNN lab controls | Edit image cells, filter values, presets, output position | Receptive field and output scores update | Convolution and scanning |
| Module 2 | CNN Explainer | Embedded explainer | Use iframe or open fallback | External layer-by-layer visualization | CNN feature hierarchy |
| Module 3 | Fixed vs Learning | Step sequence | Advance through learning steps | Prediction, target, error, and weights reveal in sequence | Learning through error |
| Module 3 | Learning in Action | K-means lab | Add points, load samples, run or step | Clusters and centroids update | Unsupervised grouping |
| Module 3 | Learning in Action | TensorFlow Playground | Interact with external embed | Decision boundary and network behavior change | Supervised learning |
| Module 3 | Learning in Action | Reinforcement lab | Run episodes, edit board, change parameters | Agent behavior, rewards, and values update | Learning from rewards |
| Module 3 | Backpropagation | Sequence buttons | Run forward pass, show error, send error backward, update weights | Animated paths and weights update | Backpropagation |
| Module 3 | Big Picture | Stage buttons | Switch between network depth stages | Layer count and summary change | Depth from stacked neurons |
| Course Evaluation | Feedback / Reflection / Knowledge Check / Results | Form steps | Answer questions and continue | Progresses through evaluation steps | Reflection and assessment |
| Completion | Completion Screen | Revisit cards and links | Revisit modules or open resources | Returns to modules or opens external resources | Course recap |

## Teacher Presentation Reference

This section is a factual guide for future writers, teachers, and script planners. It is not a presentation script.

Suggested demonstration moments:

- Landing page: show the three-module arc before entering the course.
- Module 1 anatomy: reveal neuron parts in order.
- Module 1 sound experiment: compare below-threshold and above-threshold input.
- Module 1 bridge: step through the biological-to-artificial mapping.
- Module 2 activation functions: compare ReLU and Sigmoid with the same slider input.
- Module 2 selectivity: load a pattern preset, then show why one neuron responds more strongly.
- Module 2 CNNs: move the active filter window and inspect the score breakdown.
- Module 3 learning example: reveal prediction, target, error, and weight update in sequence.
- Module 3 learning labs: demonstrate one action each in clustering, supervised embed, and reinforcement lab.
- Module 3 backpropagation: show forward pass first, then backward error flow.
- Module 3 big picture: use the final depth diagram as a recap.

Possible pause points:

- After selective attention in Module 1
- After the threshold meter first crosses threshold
- After the first biological-to-artificial mapping step
- After hidden layers are introduced in Module 2
- After the Hubel and Wiesel selectivity example
- After the first successful CNN filter scan
- After the Module 3 error measure step
- After comparing supervised, unsupervised, and reinforcement learning
- After the first reinforcement-learning reward sequence
- After the first backpropagation weight update

Possible fun fact placements:

- Landing page neuron count (`86B`)
- Module 1 anatomy part reveals
- Module 1 threshold firing moment
- Module 2 Hubel and Wiesel experiment
- Module 2 CNN kernel and padding explanation
- Module 3 learning-type examples
- Module 3 reinforcement reward/penalty example
- Module 3 deep-network recap

## Development Notes

### Stack

- React
- Vite
- ESLint
- Framer Motion
- React Three Fiber
- GSAP

### App flow

- The root app shell is in `src/App.jsx`.
- Screen changes are controlled with `currentView` and `goTo(view)`.
- The current live views are:
  - `landing`
  - `module1`
  - `module2`
  - `module3`
  - `courseEvaluation`
  - `completion`

### Key files

- `src/App.jsx`
  - top-level view flow
- `src/pages/LandingPage.jsx`
  - landing page and course entry
- `src/components/ui/ModuleNav.jsx`
  - shared module sidebar and mobile section navigation
- `src/modules/Module1`
  - biological neuron module
- `src/modules/Module2`
  - pattern-recognition module
- `src/modules/Module3`
  - learning module
- `src/modules/CourseEvaluation`
  - post-course evaluation flow
- `src/pages/CompletionScreen.jsx`
  - completion and revisit screen

### Content organization

- Each module defines its own local `SECTIONS` array inside its `index.jsx`.
- Section labels are not centralized in one registry.
- Each module owns its own section composition and content components.
- Styling is split across shared styles and module-specific CSS files.

### Module 1 Section C

The current live sound experiment is driven by shared React state so the word-flow scene, soma threshold state, result panel, and embedded neuron panel stay coordinated.

Current live files:

- `src/modules/Module1/components/SoundNeuronExperiment.jsx`
- `src/modules/Module1/hooks/useSoundNeuronExperiment.js`
- `src/modules/Module1/components/NeuronResponsePanel.jsx`
- `src/modules/Module1/components/PhetNeuronPanel.jsx`
- `src/modules/Module1/components/PhetNeuronEmbed.jsx`
- `src/modules/Module1/hooks/usePhetNeuronController.js`

Notes:

- The current live section automatically triggers neuron stimulation when the sound signal reaches threshold.
- Manual `Stimulate Neuron` is still available.

### PhET neuron integration

Module 1 Section C embeds a neuron simulation on the right side of the lesson shell.

Current app behavior:

- the lesson shell is in this app
- the neuron simulator is embedded on the right side of the sound experiment
- the current UI can trigger the same stimulation path both manually and from the threshold event in the sound experiment

Source repo noted in the project:

- `https://github.com/phetsims/neuron`

Helper scripts:

- `scripts/setup-phet-neuron.ps1`
- `scripts/build-phet-neuron.ps1`

Current Windows caveat recorded in the repository:

- the upstream PhET build may break when the workspace path contains spaces
- if needed, build the vendor tree from a no-spaces path before copying the output into `public/vendor/phet/neuron`

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Deploy:

```bash
npm run deploy
```

## Repository Structure

```text
src/
  components/
    ui/
  modules/
    CourseEvaluation/
    Module1/
    Module2/
    Module3/
  pages/
public/
scripts/
```

## Known Gaps / Future Refinement

Verified opportunities from the current site review:

- Module 3 section label `Fixed vs Learning` does not closely match the visible section content and may need a clearer name later.
- Some files still contain visible encoding artifacts such as corrupted arrows or emoji-like strings in source text.
- The landing page, module pages, Course Evaluation, and Completion screen are all part of the real site flow and should stay documented together.
- External embeds and simulations are important parts of the experience, so fallback behavior and attribution links should stay documented.
- The README should be reviewed again whenever section labels, embeds, or the evaluation flow change.

Uncertain items:

- Inference: some teacher pause points and fun-fact placements are recommended from the current interaction flow, but they are not enforced by the app.
- The upstream PhET limitation note should be rechecked if the embedding strategy changes again.

## Attribution

Attribution links used by the app are recorded in:

- `src/assets/attribute.txt`
