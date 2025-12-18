# Single Neuron Model - Week 1 MVP

This is a small React single-page app that shows how a single neuron can be modeled as:

- multiple input signals,
- all inputs added together,
- compared against one threshold,
- producing either **fire** or **no fire**.

## How it works

- 3–5 input sliders control the strength of each input.
- A threshold slider sets the gate level.
- The app shows:
  - each input value,
  - the total input (sum of all inputs),
  - the threshold value,
  - whether the neuron **fires** or **does not fire**.

All behavior is deterministic: the same inputs and threshold always give the same result.

## Running locally

From this folder:

```bash
npm install
npm run start
```

Then open `http://localhost:3000` in your browser.

## Building for GitHub Pages

```bash
npm run build
```

The static files will be in the `dist` folder. You can publish `dist` to GitHub Pages.


