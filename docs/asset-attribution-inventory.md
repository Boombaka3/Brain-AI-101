# Asset Attribution Inventory

This file lists the third-party or source-referenced assets currently used in the Brain AI 101 website, where they appear, whether a visible on-page link exists, and any follow-up needed.

## Linked on the website

| Asset / Source | Used in | Visible link on the site | Notes |
| --- | --- | --- | --- |
| `src/assets/pay-attention-not-css.svg` and `src/assets/eyes-not-css.svg` | `src/modules/Module1/sections/intro/HearingAttentionScene.jsx` | Yes | Linked as Storyset scene illustrations. |
| `src/assets/vector-diagram-of-neuron-anatomy.svg` | `src/components/diagrams/BiologyDiagram/BiologyDiagram.jsx`, `src/modules/Module1/sections/anatomy/GuidedAnatomyOverlay.jsx` | Yes | Links now point to the Wikimedia Commons source for `Complete_neuron_cell_diagram_en.svg` by LadyofHats, which also matches `src/assets/nerons/ATTRIBUTION.txt`. |
| PhET Neuron simulator | `src/modules/Module1/sections/interaction/PhetNeuronPanel.jsx` via `SoundNeuronExperiment.jsx` | Yes | Linked to `phetsims/neuron` on GitHub. |
| Hubel/Wiesel selectivity figure | `src/modules/Module2/sections/selectivity/HubelWieselStory.jsx` | Yes | Linked to the cited MDPI article / DOI. |
| CNN Explainer | `src/modules/Module2/sections/cnn/CnnExplainerSection.jsx` | Yes | Linked to `poloclub/cnn-explainer` on GitHub. |
| TensorFlow Playground | `src/modules/Module3/sections/labs/NetworkPlaygroundCard.jsx` | Yes | Linked to `tensorflow/playground` on GitHub. |
| NeuroCorrelation simulation/article | `src/modules/Module3/sections/backprop/BrainConnection.jsx` | Yes | Linked to Axel Wickman’s repo/article. |

## Referenced in repo attribution notes, but not currently linked in the UI

| Source reference | Current status | Recommendation |
| --- | --- | --- |
| `https://github.com/thinkphp/k-means-clustering` in `src/assets/attribute.txt` | No visible link in the current k-means UI. Current implementation appears to be a custom in-app demo. | Verify whether this repo was actually used for the shipped implementation. If yes, add a visible source note in Module 3 clustering. If no, remove the stale line from `src/assets/attribute.txt`. |
| `https://github.com/awjuliani/web-rl-playground` in `src/assets/attribute.txt` | No visible link in the current reinforcement UI. Current reinforcement section uses a different in-app implementation and NeuroCorrelation appears elsewhere. | Verify whether this attribution is still relevant. Remove if stale. |

## Local assets that need source confirmation

| Asset | Used in | Current status |
| --- | --- | --- |
| `src/assets/ChatGPT Image Apr 24, 2026, 01_40_31 PM.png` | `src/modules/Module1/sections/bridge/BridgeToAnn.jsx` | No attribution note found. If it is internally generated, label it as internal/generated somewhere in repo docs. |
| `public/images/bust.png` | `src/modules/LandingPage/index.jsx` | No attribution note found. Confirm whether this is self-created, licensed, or needs citation. |

## Repo-only attribution files already present

| File | Covers |
| --- | --- |
| `src/assets/attribute.txt` | Miscellaneous source links collected for the repo. |
| `src/assets/nerons/ATTRIBUTION.txt` | Close-up neuron crops derived from the Wikimedia neuron diagram. |
| `public/assets/module2/selectivity/ATTRIBUTION.md` | Hubel/Wiesel figure citation and license note. |

## Minimal fixes applied in this pass

- Added a visible PhET GitHub attribution link in the neuron simulator panel.
- Turned on the PhET attribution line in the sound experiment panel.
- Corrected the on-page neuron overview/diagram source links to Wikimedia Commons so they match the repo attribution notes.
- Added a visible citation link for the Hubel/Wiesel figure.
- Updated the Storyset caption wording so it clearly covers both SVG scene illustrations.
