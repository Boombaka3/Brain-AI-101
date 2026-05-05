# AIweb

Interactive learning site for biological neurons, neural networks, and AI concepts, built with React and Vite.

## Stack

- React
- Vite
- ESLint
- Framer Motion
- React Three Fiber

## Main App Areas

- `src/modules/Module1`
  Biological neuron concepts, anatomy, threshold, and the sound experiment.
- `src/modules/Module2`
  Pattern recognition and visual feature learning.
- `src/modules/Module3`
  Supervised, unsupervised, and reinforcement learning activities.

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

## Project Notes

### Module 1 Section C

The sound experiment in Module 1 is driven by shared React state so the word-flow scene, threshold state, and neuron panel stay coordinated.

Relevant files:

- `src/modules/Module1/components/HotSurfaceInteractionPanel.jsx`
- `src/modules/Module1/hooks/useSoundNeuronExperiment.js`
- `src/modules/Module1/components/PhetNeuronPanel.jsx`
- `src/modules/Module1/components/PhetNeuronEmbed.jsx`
- `src/modules/Module1/hooks/usePhetNeuronController.js`

### PhET neuron integration

Module 1 Section C is being integrated with the upstream PhET neuron simulator:

- Source repo: `https://github.com/phetsims/neuron`
- Current app behavior: the lesson shell is in this app, and the neuron simulator is embedded on the right side
- Current limitation: exact iframe-driven firing sync needs a same-origin local PhET build plus a small message bridge

Helper scripts:

- `scripts/setup-phet-neuron.ps1`
- `scripts/build-phet-neuron.ps1`

Current Windows caveat:

- the upstream PhET build currently breaks when the workspace path contains spaces, such as `D:\Qixuan Wu\Web\AIweb\AIweb`
- if needed, build the PhET vendor tree from a no-spaces path before copying the output back into `public/vendor/phet/neuron`

## Repository Structure

```text
src/
  components/
  modules/
    Module1/
    Module2/
    Module3/
  pages/
public/
scripts/
```

## Attribution

Attribution links used by the app are recorded in:

- `src/assets/attribute.txt`
