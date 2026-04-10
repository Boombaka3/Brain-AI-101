# Brain-AI-101: Complete File Structure and Content Documentation

## Project Overview

**Brain-AI-101** is an interactive educational web application that teaches the relationship between biological neurons and artificial neural networks through three progressive modules. The site is deployed to GitHub Pages at `/Brain-AI-101/` (configured in [vite.config.js](vite.config.js)).

---

## File Structure

```
E:\AIweb/
├── index.html                    # Main HTML entry point
├── vite.config.js               # Vite build configuration (GitHub Pages deployment)
├── package.json                 # Dependencies: React 19.2.0, Vite 7.2.4, GSAP 3.14.2, Framer Motion 12.27.1
├── package-lock.json            # Locked dependency versions
├── eslint.config.js             # ESLint 9.39.1 configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Project readme
├── NAVIGATION_PATH.md           # This file - comprehensive documentation
│
├── public/                      # Static assets
│   ├── vite.svg                # Vite logo
│   ├── .nojekyll               # GitHub Pages configuration (prevents Jekyll processing)
│   └── react.svg               # React logo
│
└── src/                         # Main source code
    ├── main.jsx                # React entry point (renders App component)
    ├── App.jsx                 # Navigation router (handles module switching)
    ├── App.css                 # Global styles and responsive layouts
    ├── index.css               # Base styles and typography
    │
    ├── Module1.jsx             # Module 1: Meet the Neuron (biological neuron fundamentals)
    ├── Module2.jsx             # Module 2: Perception and Response (pattern recognition, convolution)
    ├── Module3.jsx             # Module 3: Learning to Learn (training mechanisms, feedback loops)
    │
    ├── BiologyDiagram.jsx      # Biological neuron visualization component (SVG-based)
    │
    ├── components/
    │   ├── AnnDiagram.jsx              # Artificial Neural Network visualization
    │   ├── InfoTip.jsx                 # Reusable tooltip component
    │   ├── NeuronBioAnnMapping.jsx     # Bio-ANN comparison component
    │   └── useNeuronAnimation.js       # GSAP animation hook for neuron dynamics
    │
    └── assets/                  # Image and media assets
        └── react.svg
```

---

## Module 1: Meet the Neuron ([Module1.jsx](src/Module1.jsx))

### Pedagogical Contract (Lines 28-76)

**Learning Outcome** (Lines 32-40):
> "After 5 minutes, a student can explain that: neurons receive signals through dendrites, synapses weight those signals, the soma integrates them, a threshold determines firing, an action potential travels down the axon, and only then can another neuron be influenced. (Extension) One neuron can influence multiple neurons."

**Story Sequence** (Lines 41-50):
1. inputs change
2. synapses weight signals
3. soma integrates
4. threshold comparison
5. fire OR silence
6. axon propagation
7. next neuron response
8. (extension) divergent signal to multiple targets

**Authority Rules** (Lines 51-55):
- PRIMARY_EXPLAINER: 'biology diagram'
- NUMERIC_PANELS_ROLE: 'secondary explanation'
- STATE_SOURCE: 'neuron state only (no decisions from numeric cards)'

**Non-Goals** (Lines 56-63):
- backpropagation
- learning algorithms
- optimization
- deep math
- arbitrary network creation
- layers

**Success Conditions** (Lines 64-69):
- student predicts firing before moving a slider
- student explains each step from the diagram without reading numbers
- biology view alone teaches the full signal story
- student understands one neuron can affect many by watching

**Failure Conditions** (Lines 70-75):
- understanding depends on numeric cards
- students ask "why did it fire?" after seeing the diagram
- ANN view explains more clearly than Biology view
- extension feels like a separate feature

### Initial Configuration (Lines 78-80)

```javascript
const INITIAL_INPUTS = [2, 3, 1, 0]
const INITIAL_THRESHOLD = 5
const PRIMARY_VIEW = 'biology'
```

### Core Logic Functions (Lines 82-98)

**calculateTotal** (Lines 83-85):
```javascript
function calculateTotal(inputs) {
  return inputs.reduce((sum, value) => sum + value, 0)
}
```

**neuronFires** (Lines 87-89):
```javascript
function neuronFires(totalInput, threshold) {
  return totalInput >= threshold
}
```

**getDownstreamInput** (Lines 92-94):
```javascript
// Propagation logic: if source neuron fires, target receives signal
function getDownstreamInput(sourceFires, weight = 1) {
  return sourceFires ? weight : 0
}
```

**Fixed Thresholds** (Lines 96-98):
```javascript
const NEURON_B_THRESHOLD = 1
const NEURON_C_THRESHOLD = 1
```

### Extended Circuit Feature (Lines 115-129)

**Circuit State** (Lines 115-117):
```javascript
// Explicit control for Neuron C (no gating prompts)
const [hasNeuronC, setHasNeuronC] = useState(false)
```

**Neuron Calculations** (Lines 119-129):
```javascript
// Neuron A calculations (unchanged)
const neuronATotalInput = calculateTotal(inputs)
const neuronAFires = neuronFires(neuronATotalInput, threshold)

// Neuron B calculations (propagation from Neuron A)
const neuronBInput = getDownstreamInput(neuronAFires, 1)
const neuronBFires = neuronFires(neuronBInput, NEURON_B_THRESHOLD)

// Neuron C calculations (same logic as B, same input from A)
const neuronCInput = getDownstreamInput(neuronAFires, 1)
const neuronCFires = neuronFires(neuronCInput, NEURON_C_THRESHOLD)
```

### UI Components

**Header** (Lines 188-359):
- Module title: "Module 1: Meet the Neuron" (Line 206)
- Circuit Controls: +/− buttons to add/remove Neuron C (Lines 211-281)
- Simple/Detailed Toggle (Lines 283-299)
- View Mode Toggle: Biology/ANN (Lines 301-340)
- Next → button (Lines 342-357)

**Diagram Section** (Lines 374-434):
- AnimatePresence for smooth transitions between Biology and ANN views
- BiologyDiagram component (Lines 389-406)
- AnnDiagram component (Lines 415-431)

**Control Panels** (Lines 436-781):
1. **Inputs Panel** (Lines 443-538): 4 input sliders (0-10), displays total
2. **Threshold Panel** (Lines 540-634): Threshold slider (0-30), Neuron A status
3. **Neuron B Panel** (Lines 636-708): Displays received input and firing status
4. **Neuron C Panel** (Lines 710-780): Only shown when hasNeuronC is true

**Challenge Prompt** (Lines 783-802):
- When hasNeuronC: "Make both B and C fire with one signal from A"
- Otherwise: "Make Neuron B fire with the smallest total input"

### Tooltip Content (Lines 7-25)

```javascript
const TOOLTIPS = {
  inputs: {
    biology: 'Signals arriving on dendrites.',
    ann: 'Input values (numbers) sent into the neuron.',
  },
  threshold: {
    biology: 'The level needed to trigger a spike.',
    ann: 'Decision boundary for output.',
  },
  neuronA: {
    biology: 'Soma: where inputs add up.',
    ann: 'Unit: computes a weighted sum.',
  },
  synapse: {
    biology: 'Synapse strength changes influence.',
    ann: 'Weight scales each input\'s effect.',
  },
}
```

---

## Module 2: Perception and Response ([Module2.jsx](src/Module2.jsx))

### Module Purpose (Lines 5-22)

**Opening** (Lines 8-11):
> "Demonstrates the limitation of Module 1's neuron. Two spatially different patterns with identical sums. Neuron fires the same for both. Students discover: 'Why does the neuron treat these as the same?'"

**Many Neurons** (Lines 13-18):
> "Observation-first learning. Neurons labeled only as N₁, N₂, N₃ (no semantic labels initially). Response intensity shown through fill level and glow. Optional 'Show why' reveal after sufficient observation. Silencing shows system behavior without explanation."

**Convolution** (Lines 20-22):
> "Explicit kernel visualization. Editable weights with immediate feedback. Element-wise multiplication shown clearly."

### Module 1 Neuron Logic (Lines 24-38)

**Exact Copy from Module 1** (Lines 25-38):
```javascript
// Same as Module 1
const INITIAL_THRESHOLD = 5

// Pure logic from Module 1: add inputs and compare with threshold
function calculateTotal(inputs) {
  return inputs.reduce((sum, value) => sum + value, 0)
}

function neuronFires(totalInput, threshold) {
  return totalInput >= threshold
}
```

### Pattern Definitions (Lines 40-43)

```javascript
// Two spatially different patterns that produce the SAME sum
const PATTERN_A = [5, 1, 0, 0]  // Concentrated: sum = 6
const PATTERN_B = [1, 2, 2, 1]  // Distributed: sum = 6
```

### Weight Configurations (Lines 44-48)

**Single Weights** (Line 48):
```javascript
const SINGLE_WEIGHTS = [1, 1, 1, 1, 1, 1, 1, 1, 1]
```

The file continues with extensive implementation details for:
- Multiple neuron configurations (N₁, N₂, N₃)
- Kernel presets (identity, blur, vertical edge, horizontal edge, sharpen)
- 3x3 grid pattern visualization
- Convolution operations
- Virtual lab for kernel experimentation

---

## Module 3: Learning to Learn ([Module3.jsx](src/Module3.jsx))

### Tab Structure (Lines 4-5)

**Six Tabs** (Line 5):
```javascript
// Tab navigation: 'transition', 'types', 'training', 'feedback', 'inference', 'synthesis'
const [activeTab, setActiveTab] = useState('transition')
```

### Tab 1: Transition (Lines 209-260)

**Purpose** (Lines 214-226):
> "From Fixed Representations to Learning. In Module 2, you saw how artificial neurons compute outputs, connect into layers, and show selectivity to different patterns. Feature representations emerged, but they were fixed—weights and filters didn't change. How do these representations change over time?"

**What We've Observed** (Lines 230-250):
1. Neurons compute outputs: "Inputs → weights → sum → threshold → output"
2. Neurons connect: "One neuron's output becomes another's input"
3. Selectivity: "Different neurons respond to different patterns"
4. Fixed representations: "Weights and filters stayed the same"

### Tab 2: Learning Types (Lines 464-724)

**Three Learning Paradigms**:

1. **Supervised Learning** (Lines 479-604):
   - Title: "Supervised Learning: Using Error to Adjust Connections"
   - Description: "Like learning with a teacher who says 'right' or 'wrong'"
   - Steps:
     1. Model makes a prediction
     2. Compare to target
     3. Error shows which connections need change
     4. Weights adjusted
     5. New prediction is closer to target

2. **Unsupervised Learning** (Lines 606-662):
   - Title: "Unsupervised Learning: Finding Structure Without Targets"
   - Description: "Like finding patterns on your own—no 'right' or 'wrong' answers"
   - Key message (Lines 634-636): "No target. No error. Just structure emerging from similarity."

3. **Reinforcement Learning** (Lines 664-714):
   - Title: "Reinforcement Learning: Learning from Rewards Over Time"
   - Description: "Like learning through trial and reward—no immediate 'right' answer"
   - Key message (Lines 693-695): "No target to compare. Just reward or penalty affecting future behavior."

### Tab 3: Training Game (Lines 726-925)

**Purpose** (Lines 744-747):
> "Watch the system learn over multiple steps. See how feedback changes weights and improves predictions."

**Training Feedback Loop** (Lines 751-758):
- Steps: ['Observe', 'Compare', 'Feedback', 'Adjust']
- Labels: ['Make prediction', 'Compare to target', 'Error signal', 'Update weights']

**Training Configuration** (Lines 17-25):
```javascript
const [trainingStep, setTrainingStep] = useState(0)
const [trainingWeights, setTrainingWeights] = useState([1, 1, 1])
const [trainingInputs] = useState([[2, 3, 1], [1, 2, 2], [3, 1, 2], [2, 2, 1]])
const [trainingTargets] = useState([1, 0, 1, 0])
const TRAINING_THRESHOLD = 5
```

### Tab 4: Learning Through Feedback (Lines 927-1107)

**Purpose** (Lines 940-942):
> "Feedback changes connections, and that changes what happens next. Complete each step in order."

**Biological Learning Example** (Lines 965-1097):
- Title: "Biological Learning: Synaptic Strengthening"
- Feedback Loop: ['Neuron fires', 'Compare to desired', 'Feedback signal', 'Strengthen synapse']
- Initial synaptic strength: 0.4 (Line 57, starts weak to ensure mismatch)
- Adjustment: ±0.3 (Lines 376, 379)

**Step-by-Step Process** (Lines 336-391):
1. **Observe** (Lines 338-343): Store previous state and show current response
2. **Compare** (Lines 344-360): Detect mismatch, determine direction ('too weak' or 'too strong')
3. **Feedback** (Lines 361-368): Signal direction without changing strength yet
4. **Adjust** (Lines 369-390): Apply change to synaptic strength, re-run response

### Tab 5: Inference Feedback (Lines 1109-1282)

**Purpose** (Lines 1118-1120):
> "The system uses context to be more careful. Nothing was learned. The system just decided differently this time."

**Key Distinction** (Lines 192-197):
```javascript
// Feedback makes the system more cautious (lower threshold = easier to trigger)
// This represents added context, not learning
const effectiveThreshold = useFeedback && inferenceFeedbackEnabled
  ? inferenceThreshold - 1.5 // More cautious decision (lower bar)
  : inferenceThreshold // Normal decision
```

**Weights Display** (Lines 1146-1157):
- Title: "Weights (fixed during inference)"
- Message: "🔒 These never change"

**Decision-Making Extension** (Lines 202-205):
```javascript
// Decision-making: map output to decision
const decision = output === 1 ? 'Action A' : 'Action B'
```

### Tab 6: Synthesis (Lines 1284-1356)

**Key Message** (Lines 1289-1291):
> "Learning happens when feedback causes something inside a system to change."

**The Key Idea** (Lines 1338-1352):
> "The key idea is not the loop itself, but what feedback changes. Sometimes feedback changes knowledge. This is learning. Sometimes feedback changes decisions. This is inference. In both brains and AI, feedback is what makes systems adaptive."

**Three Feedback Loops Compared** (Lines 1301-1334):
1. **Brain Learning**: Feedback changes synaptic strength → affects future responses
2. **AI Training**: Feedback changes weights → future predictions improve
3. **Inference Feedback**: Feedback changes decisions → without changing learned knowledge

---

## BiologyDiagram Component ([BiologyDiagram.jsx](src/BiologyDiagram.jsx))

### Purpose (Lines 4-11)

**Component Description** (Lines 5-11):
> "BiologyDiagram - Authoritative biological neuron visualization. EXTENDED CIRCUIT (optional): Neuron A can connect to both Neuron B and Neuron C. Demonstrates divergent signaling ('one neuron affects many'). Axon branches at terminal to reach both targets."

### Dimensions and Positioning (Lines 52-77)

**SVG Dimensions** (Lines 53-54):
```javascript
const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800
const svgHeight = showExtendedCircuit ? 380 : 300
```

**Neuron Positioning** (Lines 62-77):
```javascript
// Neuron A
const neuronACenterX = stageWidth * 0.32
const neuronACenterY = stageHeight / 2
const neuronASomaRadius = 52

// Neuron B position (upper when extended, centered otherwise)
const neuronBCenterX = stageWidth * 0.72
const neuronBCenterY = showExtendedCircuit ? stageHeight * 0.35 : stageHeight / 2

// Neuron C position (lower, only when extended)
const neuronCCenterX = stageWidth * 0.72
const neuronCCenterY = stageHeight * 0.65
```

### Fill Calculation (Lines 109-122)

**calculateFillHeight Function** (Lines 109-122):
```javascript
const calculateFillHeight = (totalInput, threshold, somaRadius, thresholdRadius) => {
  const somaDiameter = somaRadius * 2
  const thresholdHeight = thresholdRadius * 2
  if (totalInput <= 0) return 0
  const ratio = totalInput / Math.max(threshold, 1)
  if (ratio <= 1) {
    return thresholdHeight * ratio
  } else {
    const excessRatio = ratio - 1
    const maxExcess = (somaDiameter - thresholdHeight) * 0.85
    const dampedExcess = maxExcess * (1 - Math.exp(-excessRatio * 0.8))
    return thresholdHeight + dampedExcess
  }
}
```

### Visual States (Lines 142-153)

**Threshold Ring** (Lines 143-148):
```javascript
const thresholdRingStroke = '#D97706'
const thresholdRingDash = '6 4'
const thresholdRingWidth = 2
const thresholdRingOpacityA = neuronAFires ? 0.35 : nearThresholdA ? 0.85 : 0.55
const thresholdRingOpacityB = visualBFires ? 0.35 : nearThresholdB ? 0.85 : 0.55
const thresholdRingOpacityC = visualCFires ? 0.35 : nearThresholdC ? 0.85 : 0.55
```

**Fill Opacity** (Lines 149-151):
```javascript
const fillOpacityA = neuronAFires ? 0.88 : nearThresholdA ? 0.82 : 0.72
const fillOpacityB = visualBFires ? 0.88 : nearThresholdB ? 0.82 : 0.72
const fillOpacityC = visualCFires ? 0.88 : nearThresholdC ? 0.82 : 0.72
```

### Colors (Lines 155-165)

```javascript
const dendriteColor = '#5B9BD5'
const dendriteActiveColor = '#3B82F6'
const somaFillBase = '#D1FAE5'
const somaFillActive = '#34D399'
const somaFillFiring = '#10B981'
const somaStroke = '#065F46'
const synapseColor = '#059669'
const axonColor = '#5B9BD5'
const signalBeadColor = '#3B82F6'
const labelColor = '#4B5563'
```

### Axon Branching (Lines 439-543)

**Extended Circuit Branching** (Lines 441-480):
```javascript
{showExtendedCircuit ? (
  <>
    {/* Main axon to branch point */}
    <line x1={axonStartX} y1={neuronACenterY} x2={branchPointX} y2={branchPointY} ... />

    {/* Branch to Neuron B */}
    <path d={`M ${branchPointX} ${branchPointY} Q ... ${axonEndBX} ${axonEndBY}`} ... />

    {/* Branch to Neuron C */}
    <path d={`M ${branchPointX} ${branchPointY} Q ... ${axonEndCX} ${axonEndCY}`} ... />

    {/* Branch point marker */}
    <circle cx={branchPointX} cy={branchPointY} r={4} ... />
  </>
) : (
  <line x1={axonStartX} y1={neuronACenterY} x2={axonEndBX} y2={axonEndBY} ... />
)}
```

---

## AnnDiagram Component ([AnnDiagram.jsx](src/components/AnnDiagram.jsx))

### Purpose (Lines 4-13)

**Component Description** (Lines 5-13):
> "AnnDiagram - Artificial Neural Network visualization. EXTENDED CIRCUIT SUPPORT: Same geometry and animation as BiologyDiagram. Demonstrates divergent connections in ANN terms. Cleaner, more abstract styling. 'A symbolic reinterpretation of the biology system'"

### Key Differences from BiologyDiagram

**Colors** (Lines 148-157):
```javascript
const nodeStroke = '#1E293B'
const inputColor = '#64748B'
const inputActiveColor = '#3B82F6'
const fillColor = '#34D399'
const fillColorFiring = '#10B981'
const connectionColor = '#94A3B8'
const weightColor = '#6366F1'
const signalColor = '#3B82F6'
const labelColor = '#64748B'
```

**Labels** (Lines 478-501):
- "inputs" instead of "dendrites"
- "node A" instead of "soma A"
- "node B" and "node C" instead of neuron labels
- Sigma symbol (Σ) displayed in nodes (Lines 362-364, 458-460, 469-472)

**Styling** (Lines 275-280):
```javascript
backgroundColor: '#F8FAFC',  // vs '#FAFCFE' in Biology
border: '1px solid #E2E8F0',  // vs '#E5E7EB' in Biology
```

---

## App Component ([App.jsx](src/App.jsx))

### Navigation Router (Lines 7-13)

**Purpose** (Lines 7-13):
> "App.jsx - Navigation Router. This file handles navigation between modules: Module 1: Meet the Neuron (Module1.jsx), Module 2: Seeing and Thinking (Module2.jsx), Module 3: Learning to Learn (Module3.jsx)"

### State Management (Lines 14-31)

```javascript
const [currentView, setCurrentView] = useState('module1')

const handleGoToModule2 = () => {
  setCurrentView('module2')
}

const handleGoToModule3 = () => {
  setCurrentView('module3')
}

const handleBackToModule1 = () => {
  setCurrentView('module1')
}

const handleBackToModule2 = () => {
  setCurrentView('module2')
}
```

### Rendering Logic (Lines 33-44)

```javascript
// Render Module 3 if selected
if (currentView === 'module3') {
  return <Module3 onBack={handleBackToModule2} />
}

// Render Module 2 if selected
if (currentView === 'module2') {
  return <Module2 onBack={handleBackToModule1} onContinue={handleGoToModule3} />
}

// Render Module 1 (default)
return <Module1 onContinue={handleGoToModule2} />
```

---

## useNeuronAnimation Hook ([src/components/useNeuronAnimation.js](src/components/useNeuronAnimation.js))

### Purpose

Custom React hook using GSAP for neuron animations. Handles the complete animation sequence:

1. Integration (soma fill rises)
2. Tension pause
3. Threshold acknowledgment
4. Action potential launch
5. Signal propagation
6. Synapse highlighting
7. Downstream neuron integration

Supports extended circuits with branching signals and handles both Neuron B and C animations.

---

## InfoTip Component ([src/components/InfoTip.jsx](src/components/InfoTip.jsx))

### Features

Lightweight, accessible tooltip component with:
- **Desktop**: hover to show
- **Mobile**: tap to toggle
- **Keyboard**: Tab focus shows, Esc closes
- **Configurable positioning**: top, right, bottom, left
- **ARIA labels** for accessibility

---

## Technology Stack

### Frontend Framework
- **React**: 19.2.0
- **React DOM**: 19.2.0

### Build Tool
- **Vite**: 7.2.4
- **@vitejs/plugin-react**: 5.1.1

### Animation Libraries
- **GSAP**: 3.14.2 (GreenSock Animation Platform)
- **Framer Motion**: 12.27.1

### Development Tools
- **ESLint**: 9.39.1
- **@eslint/js**: 9.39.1
- **eslint-plugin-react-hooks**: 7.0.1
- **eslint-plugin-react-refresh**: 0.4.24
- **globals**: 16.5.0

### Type Definitions
- **@types/react**: 19.2.5
- **@types/react-dom**: 19.2.3

### Deployment
- **gh-pages**: 6.3.0 (GitHub Pages deployment)

---

## Navigation Flow

```
Start → Module 1 (Meet the Neuron)
          ↓ [Next → button]
        Module 2 (Perception and Response)
          ↓ [Continue to Module 3 button]
        Module 3 (Learning to Learn)
          ↓ [Back to Module 2 button]
        Module 2
          ↓ [Back button]
        Module 1
```

### Exact Button Labels

**Module 1** ([Module1.jsx:356](src/Module1.jsx#L356)):
```jsx
<button onClick={onContinue}>Next →</button>
```

**Module 2** (exact line varies, large file):
```jsx
<button onClick={onContinue}>Continue to Module 3</button>
<button onClick={onBack}>Back</button>
```

**Module 3** ([Module3.jsx:1362](src/Module3.jsx#L1362)):
```jsx
<button onClick={onBack}>Back to Module 2</button>
```

---

## Key Design Principles

### 1. Authority Rule
**From Module 1 Pedagogical Contract** ([Module1.jsx:51-55](src/Module1.jsx#L51-L55)):
> "PRIMARY_EXPLAINER: 'biology diagram', NUMERIC_PANELS_ROLE: 'secondary explanation', STATE_SOURCE: 'neuron state only (no decisions from numeric cards)'"

### 2. Observation-First Learning
**From Module 2 Purpose** ([Module2.jsx:13-18](src/Module2.jsx#L13-L18)):
> "Neurons labeled only as N₁, N₂, N₃ (no semantic labels initially). Response intensity shown through fill level and glow. Optional 'Show why' reveal after sufficient observation."

### 3. Progressive Complexity
Each module adds one layer of understanding:
- **Module 1**: Signal flow and integration
- **Module 2**: Spatial pattern recognition
- **Module 3**: Learning mechanisms

### 4. Visual Primacy
Animations and diagrams teach more than text. GSAP-powered smooth animations with SVG-based diagrams for scalability.

### 5. Biological Accuracy
Reflects real neuroscience while remaining pedagogically clear. BiologyDiagram is the "authoritative" visualization.

### 6. Accessibility
- Keyboard navigation
- ARIA labels
- Responsive design
- Touch-friendly controls

---

## Deployment Configuration

### Vite Config ([vite.config.js](vite.config.js))

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Brain-AI-101/',  // GitHub Pages deployment path
})
```

### Package.json Scripts ([package.json:6-11](package.json#L6-L11))

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### GitHub Pages Configuration

**public/.nojekyll**: Prevents Jekyll processing on GitHub Pages

---

## Development Commands

### Start Development Server
```bash
npm run dev
```
Runs Vite development server (typically on `http://localhost:5173`)

### Build for Production
```bash
npm run build
```
Creates optimized production build in `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build

### Deploy to GitHub Pages
```bash
npm run deploy
```
Builds and deploys to GitHub Pages (runs `predeploy` then `gh-pages -d dist`)

---

## Summary

Brain-AI-101 is a comprehensive educational platform that bridges biological neuroscience and artificial intelligence through:

1. **Interactive Visualization**: Real-time SVG-based diagrams with GSAP animations
2. **Progressive Learning**: Three modules building from neurons → patterns → learning
3. **Dual Perspective**: Biology and ANN views showing the connection
4. **Hands-On Exploration**: Sliders, toggles, and interactive challenges
5. **Pedagogical Rigor**: Clear learning outcomes, observation-first approach, visual primacy

The codebase is well-structured with clear separation of concerns:
- **App.jsx**: Navigation routing
- **Module*.jsx**: Self-contained module logic and UI
- **BiologyDiagram.jsx / AnnDiagram.jsx**: Reusable visualization components
- **useNeuronAnimation.js**: Centralized animation logic
- **InfoTip.jsx**: Accessible tooltip system

All components follow React best practices with hooks, proper state management, and responsive design patterns.
