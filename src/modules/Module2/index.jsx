import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateTotal, neuronFires } from '../../utils/neuronLogic'
import ProgressRail from '../../components/ui/ProgressRail'
import TimeIndicator from '../../components/ui/TimeIndicator'
import HubelWieselStory from './components/HubelWieselStory'
import { applyConvolution as _applyConvolution, toGrayscale as _toGrayscale, preprocessForClassification as _preprocessForClassification } from './utils/imageProcessing'
import { classifyDigit as _classifyDigit } from './utils/classifier'
import './module2.css'

const PatternGrid3D = lazy(() => import('../../components/three/PatternGrid3D'))

/**
 * Module 2: Perception and Response
 * 
 * OPENING: Demonstrates the limitation of Module 1's neuron
 * - Two spatially different patterns with identical sums
 * - Neuron fires the same for both
 * - Students discover: "Why does the neuron treat these as the same?"
 * 
 * MANY NEURONS: Observation-first learning
 * - Neurons labeled only as N₁, N₂, N₃ (no semantic labels initially)
 * - Response intensity shown through fill level and glow
 * - Optional "Show why" reveal after sufficient observation
 * - Silencing shows system behavior without explanation
 * 
 * CONVOLUTION: Explicit kernel visualization
 * - Editable weights with immediate feedback
 * - Element-wise multiplication shown clearly
 */

// ============================================
// MODULE 1 NEURON LOGIC (EXACT COPY)
// ============================================

// Same as Module 1
const INITIAL_THRESHOLD = 5

// Two spatially different patterns that produce the SAME sum
const PATTERN_A = [5, 1, 0, 0]  // Concentrated: sum = 6
const PATTERN_B = [1, 2, 2, 1]  // Distributed: sum = 6

// ============================================
// WEIGHT CONFIGURATIONS
// ============================================

const SINGLE_WEIGHTS = [1, 1, 1, 1, 1, 1, 1, 1, 1]

// Semantic labels hidden initially - revealed through observation
const NEURON_CONFIGS = {
  alpha: {
    symbol: 'N₁',
    revealedName: 'Vertical',
    weights: [2, 0, 2, 2, 0, 2, 2, 0, 2],
    color: '#3B82F6'
  },
  beta: {
    symbol: 'N₂',
    revealedName: 'Horizontal',
    weights: [2, 2, 2, 0, 0, 0, 2, 2, 2],
    color: '#8B5CF6'
  },
  gamma: {
    symbol: 'N₃',
    revealedName: 'Diagonal',
    weights: [2, 0, 0, 0, 2, 0, 0, 0, 2],
    color: '#EC4899'
  }
}

// Default kernel: vertical edge detector (NOT all zeros)
const DEFAULT_KERNEL = [
  1, 0, -1,
  1, 0, -1,
  1, 0, -1
]

// Kernel presets for exploration (used in Scanning view)
const KERNEL_PRESETS = {
  verticalEdge: [1, 0, -1, 1, 0, -1, 1, 0, -1],
  horizontalEdge: [1, 1, 1, 0, 0, 0, -1, -1, -1],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
}

// ============================================
// VIRTUAL LAB - KERNEL PRESETS & PROCESSING
// ============================================

const LAB_KERNEL_PRESETS = {
  identity: { 
    name: 'Identity', 
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    category: 'none',
    description: 'No change — passes through unchanged.'
  },
  blur: { 
    name: 'Blur (Box)', 
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    category: 'blur',
    description: 'Like pooling / smoothing noise.'
  },
  gaussian: { 
    name: 'Blur (Gaussian)', 
    kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    category: 'blur',
    description: 'Like pooling / smoothing noise.'
  },
  sharpen: { 
    name: 'Sharpen', 
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    category: 'sharpen',
    description: 'Like enhancing contrast boundaries.'
  },
  verticalEdge: { 
    name: 'Vertical Edge', 
    kernel: [1, 0, -1, 2, 0, -2, 1, 0, -1],
    category: 'edge',
    description: 'Like simple cells detecting vertical edges.'
  },
  horizontalEdge: { 
    name: 'Horizontal Edge', 
    kernel: [1, 2, 1, 0, 0, 0, -1, -2, -1],
    category: 'edge',
    description: 'Like simple cells detecting horizontal edges.'
  },
  emboss: { 
    name: 'Emboss', 
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    category: 'edge',
    description: 'Like detecting directional gradients.'
  }
}

// Bio-bridge text based on kernel category
const LAB_BIO_BRIDGE = {
  none: 'The kernel passes signals through unchanged.',
  edge: 'Like simple cells in V1 detecting edges.',
  blur: 'Like pooling — smoothing noise and averaging.',
  sharpen: 'Like enhancing contrast at boundaries.'
}

// Max dimension for processing (keeps it fast)
const LAB_MAX_IMAGE_SIZE = 400

// Re-export imported utils under original names so existing call-sites work unchanged
const applyConvolution = _applyConvolution
const toGrayscale = _toGrayscale
const preprocessForClassification = _preprocessForClassification
const classifyDigitImpl = _classifyDigit

// implementations live in utils/imageProcessing.js and utils/classifier.js


const THRESHOLD = 4

// ============================================
// OUTPUT MODES (Behavioral, not mathematical)
// ============================================

// Thresholds for smooth mode's linear ramp
const SMOOTH_LOW = 2
const SMOOTH_HIGH = 6

// Scale factor for multi-neuron output bars
const RELU_SCALE = 0.15

function computeOutput(sum, threshold, mode) {
  switch (mode) {
    case 'smooth':
      // Gradual: linear ramp from 0 to 1 between low and high
      if (sum <= SMOOTH_LOW) return 0
      if (sum >= SMOOTH_HIGH) return 1
      return (sum - SMOOTH_LOW) / (SMOOTH_HIGH - SMOOTH_LOW)
    case 'proportional':
      // Proportional: scales with positive sum (ignores negative)
      return Math.max(0, sum)
    case 'yesno':
    default:
      // Binary: snap on/off at threshold
      return sum >= threshold ? 1 : 0
  }
}

// Simple ReLU-like activation for multi-neuron and convolution views
function computeActivation(sum, threshold, type) {
  if (type === 'relu') {
    return Math.max(0, sum - threshold)
  }
  return sum >= threshold ? 1 : 0
}

// Display value for output (handles proportional mode's unbounded nature)
function getDisplayOutput(output, mode) {
  if (mode === 'proportional') {
    if (output > 9) return '9+'
    return output.toString()
  }
  if (mode === 'smooth') {
    return (output * 100).toFixed(0) + '%'
  }
  return output.toString()
}

function computeWeightedSum(grid, weights) {
  return grid.reduce((sum, val, i) => sum + val * weights[i], 0)
}

// ============================================
// CONVOLUTION HELPERS
// ============================================

// 5x5 sample image with edges
const SAMPLE_IMAGE = [
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
]

function getReceptiveFieldValues(image, row, col, imageWidth = 5) {
  const values = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = (row + r) * imageWidth + (col + c)
      values.push(image[idx] ?? 0)
    }
  }
  return values
}

function computeOutputMap(image, weights, threshold) {
  const outputSize = 3 // 5 - 3 + 1
  const output = []
  for (let r = 0; r < outputSize; r++) {
    for (let c = 0; c < outputSize; c++) {
      const receptiveField = getReceptiveFieldValues(image, r, c)
      const sum = computeWeightedSum(receptiveField, weights)
      const activation = computeActivation(sum, threshold, 'relu')
      output.push({ row: r, col: c, sum, activation })
    }
  }
  return output
}

// ============================================
// STEP 0: TRANSITION ARRANGEMENTS
// ============================================

// Three input arrangements that all produce the SAME total (6)
// Students see different "shapes" but same output
const TRANSITION_ARRANGEMENTS = [
  { 
    // Arrangement 1: Vertical line (middle column)
    inputs: [0, 2, 0, 0, 2, 0, 0, 2, 0], // 3 cells × 2 each = 6
    label: 'vertical line'
  },
  { 
    // Arrangement 2: Diagonal
    inputs: [2, 0, 0, 0, 2, 0, 0, 0, 2], // 3 cells × 2 each = 6
    label: 'diagonal'
  },
  { 
    // Arrangement 3: Corners (top-left and bottom-right pairs)
    inputs: [1, 1, 0, 0, 0, 0, 2, 0, 2], // 4 cells = 6
    label: 'scattered'
  }
]

// Verify all arrangements sum to same value
if (typeof window !== 'undefined') {
  const totals = TRANSITION_ARRANGEMENTS.map(a => a.inputs.reduce((s, v) => s + v, 0))
  console.assert(totals.every(t => t === totals[0]), `Arrangement totals must match: ${totals}`)
}

// ============================================
// STEP REGISTRY - Defines learning flow for Back/Next
// ============================================

const STEP_REGISTRY = [
  { 
    id: 'transition', 
    defaultView: 'transition', 
    title: 'Why Location Matters',
    guidance: 'Notice: different patterns, same output. The neuron only knows "how much."'
  },
  { 
    id: 'single', 
    defaultView: 'one', 
    title: 'One Neuron',
    guidance: 'Weights create preference — some patterns matter more than others.'
  },
  { 
    id: 'selectivity', 
    defaultView: 'many', 
    title: 'Many Neurons',
    guidance: 'Different neurons respond to different features. Watch the fill levels.'
  },
  { 
    id: 'convolution', 
    defaultView: 'scanning', 
    title: 'Scanning',
    guidance: 'The same weights slide across the image — this is how the brain scans for features.'
  },
  { 
    id: 'lab', 
    defaultView: 'lab', 
    title: 'Virtual Lab',
    guidance: 'Apply what you learned: upload an image and see kernels in action.'
  }
]

// View modes and their labels/tooltips for the tab bar
const VIEW_MODES = [
  { id: 'transition', label: 'Transition', tooltip: 'See how location gets lost' },
  { id: 'one', label: 'One', tooltip: 'One neuron + weights = selectivity' },
  { id: 'many', label: 'Many', tooltip: 'Multiple neurons, each with different weights' },
  { id: 'scanning', label: 'Scanning', tooltip: 'Same weights slide across the image' },
  { id: 'lab', label: 'Lab', tooltip: 'Try kernels on real images' }
]

// Which view modes are enabled for each step
// Soft guidance: most views enabled, but suggested order via Back/Next
const ENABLED_VIEWS_BY_STEP = {
  transition: ['transition', 'one'],  // Can peek ahead to One
  single: ['transition', 'one', 'many', 'lab'],  // Can explore
  selectivity: ['transition', 'one', 'many', 'scanning', 'lab'],  // More open
  convolution: ['transition', 'one', 'many', 'scanning', 'lab'],  // All main content
  lab: ['transition', 'one', 'many', 'scanning', 'lab']  // All enabled
}

// ============================================
// MAIN COMPONENT
// ============================================

function Module2({ onBack, onContinue }) {
  // ============================================
  // UNIFIED NAVIGATION STATE
  // ============================================
  
  // stepIndex controls learning progression (Back/Next)
  const [stepIndex, setStepIndex] = useState(0)
  
  // viewMode controls which sub-view is displayed (tabs)
  // Initialized to default view for step 0
  const [viewMode, setViewMode] = useState(STEP_REGISTRY[0].defaultView)
  
  // Transition view state
  const [arrangementIndex, setArrangementIndex] = useState(0)
  const [arrangementsViewed, setArrangementsViewed] = useState(new Set([0]))
  const transitionFillRef = useRef(null)
  const transitionFillLineRef = useRef(null)
  const transitionAnimRef = useRef(null)
  
  // Shared grid state (used by One, Many, Scanning, Lab)
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [outputMode, setOutputMode] = useState('yesno')
  const [currentPreset, setCurrentPreset] = useState(null)
  
  // ============================================
  // CAUSAL LEARNING STATE
  // ============================================
  
  // Track if user has interacted (outputs hidden until interaction)
  const [singleHasInteracted, setSingleHasInteracted] = useState(false)
  const [manyHasInteracted, setManyHasInteracted] = useState(false)
  
  // Track interaction count for soft reveal (observation-based)
  const [manyInteractionCount, setManyInteractionCount] = useState(0)
  const [showInsights, setShowInsights] = useState(false) // User-controlled reveal
  
  // Priority 3: Silenced neurons
  const [silencedNeurons, setSilencedNeurons] = useState({
    alpha: false, beta: false, gamma: false
  })
  const [dropoutMode, setDropoutMode] = useState(false)
  const [dropoutTarget, setDropoutTarget] = useState(null)
  
  // Priority 4: Convolution state - starts EMPTY (no positions visited)
  const [convImage, setConvImage] = useState([...SAMPLE_IMAGE])
  const [kernel, setKernel] = useState([...DEFAULT_KERNEL]) // Editable kernel
  const [receptiveFieldPos, setReceptiveFieldPos] = useState({ row: 0, col: 0 }) // Start at 0,0
  const [storedOutputs, setStoredOutputs] = useState({}) // Only store computed values
  const [isAnimating, setIsAnimating] = useState(false)
  
  // ============================================
  // LAB VIEW STATE
  // ============================================
  
  const [labTab, setLabTab] = useState('kernels')  // 'kernels' | 'classifier'
  const [labImage, setLabImage] = useState(null)   // Original image as data URL
  const [labImageData, setLabImageData] = useState(null)  // Grayscale ImageData
  const [labProcessedUrl, setLabProcessedUrl] = useState(null)  // Processed image URL
  const [labKernelPreset, setLabKernelPreset] = useState('identity')
  const [labKernel, setLabKernel] = useState([...LAB_KERNEL_PRESETS.identity.kernel])
  const [labNormalize, setLabNormalize] = useState(true)
  const [labProcessing, setLabProcessing] = useState(false)
  const [labImageSize, setLabImageSize] = useState({ width: 0, height: 0 })
  
  // Classifier demo state
  const [classifierImage, setClassifierImage] = useState(null)  // Original image URL
  const [classifierImageEl, setClassifierImageEl] = useState(null)  // HTMLImageElement for processing
  const [classifierPreview, setClassifierPreview] = useState(null)  // 28x28 preview URL
  const [classifierResult, setClassifierResult] = useState(null)  // {label, confidence, allScores}
  const [classifierRunning, setClassifierRunning] = useState(false)
  const [classifierModel, setClassifierModel] = useState('digits')  // 'digits' (only option for now)
  
  // Refs for canvas processing
  const labCanvasRef = useRef(null)
  const labOutputCanvasRef = useRef(null)
  const labFileInputRef = useRef(null)
  const classifierFileInputRef = useRef(null)
  
  // Refs for GSAP
  const somaFillRef = useRef(null)
  const somaFillLineRef = useRef(null)
  const somaFillRefs = useRef({})
  
  // ============================================
  // DERIVED STATE
  // ============================================
  
  const currentStepConfig = STEP_REGISTRY[stepIndex]
  const enabledViews = ENABLED_VIEWS_BY_STEP[currentStepConfig.id] || []
  
  // Transition view computed values
  const currentArrangement = TRANSITION_ARRANGEMENTS[arrangementIndex]
  const transitionTotal = currentArrangement.inputs.reduce((sum, v) => sum + v, 0)
  const transitionFires = neuronFires(transitionTotal, INITIAL_THRESHOLD)
  const hasSeenMultiple = arrangementsViewed.size >= 2
  
  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  
  // Back/Next ONLY change stepIndex, then set viewMode to step's default
  const handlePrevStep = () => {
    if (stepIndex === 0) {
      onBack()
    } else {
      const newIndex = stepIndex - 1
      setStepIndex(newIndex)
      setViewMode(STEP_REGISTRY[newIndex].defaultView)
    }
  }
  
  const handleNextStep = () => {
    if (stepIndex >= STEP_REGISTRY.length - 1) {
      if (onContinue) onContinue()
    } else {
      const newIndex = stepIndex + 1
      setStepIndex(newIndex)
      setViewMode(STEP_REGISTRY[newIndex].defaultView)
    }
  }
  
  // View mode tabs ONLY change viewMode, NEVER stepIndex
  const handleViewModeChange = (mode) => {
    // Only allow changing to enabled views
    if (enabledViews.includes(mode)) {
      setViewMode(mode)
    }
  }
  
  // Cycle arrangement (Transition view only)
  const cycleArrangement = () => {
    const nextIndex = (arrangementIndex + 1) % TRANSITION_ARRANGEMENTS.length
    setArrangementIndex(nextIndex)
    setArrangementsViewed(prev => new Set([...prev, nextIndex]))
  }
  
  // ============================================
  // TRANSITION VIEW ANIMATION
  // ============================================
  
  useEffect(() => {
    if (viewMode !== 'transition' || !transitionFillRef.current) return
    
    if (transitionAnimRef.current) transitionAnimRef.current.kill()
    
    const neuronRadius = 50
    const maxFillHeight = neuronRadius * 2 * 0.85
    const fillRatio = Math.min(1, transitionTotal / (INITIAL_THRESHOLD * 1.5))
    const fillHeight = maxFillHeight * fillRatio
    const fillTopY = 180 + neuronRadius - fillHeight
    
    transitionAnimRef.current = gsap.to(transitionFillRef.current, {
      attr: { y: fillTopY, height: Math.max(0, fillHeight) },
      duration: 0.35,
      ease: 'power2.out'
    })
    
    if (transitionFillLineRef.current) {
      gsap.to(transitionFillLineRef.current, {
        attr: { y1: fillTopY, y2: fillTopY },
        duration: 0.35,
        ease: 'power2.out'
      })
    }
    
    return () => {
      if (transitionAnimRef.current) transitionAnimRef.current.kill()
    }
  }, [viewMode, arrangementIndex, transitionTotal])
  
  // ============================================
  // LAB VIEW HANDLERS
  // ============================================
  
  // Handle image upload
  const handleLabImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Scale down if needed
        let width = img.width
        let height = img.height
        if (width > LAB_MAX_IMAGE_SIZE || height > LAB_MAX_IMAGE_SIZE) {
          const scale = LAB_MAX_IMAGE_SIZE / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        
        setLabImageSize({ width, height })
        setLabImage(event.target.result)
        
        // Create canvas and convert to grayscale
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Get image data and convert to grayscale
        const imageData = ctx.getImageData(0, 0, width, height)
        toGrayscale(imageData)
        setLabImageData(imageData)
        
        // Apply current kernel
        processLabImage(imageData, labKernel, labNormalize)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }
  
  // Process image with current kernel
  const processLabImage = (imageData, kernelToUse, normalize) => {
    if (!imageData) return
    
    setLabProcessing(true)
    
    // Use requestAnimationFrame to keep UI responsive
    requestAnimationFrame(() => {
      const processed = applyConvolution(
        imageData, 
        imageData.width, 
        imageData.height, 
        kernelToUse, 
        normalize
      )
      
      // Create output canvas and get data URL
      const canvas = document.createElement('canvas')
      canvas.width = imageData.width
      canvas.height = imageData.height
      const ctx = canvas.getContext('2d')
      ctx.putImageData(processed, 0, 0)
      
      setLabProcessedUrl(canvas.toDataURL())
      setLabProcessing(false)
    })
  }
  
  // Handle kernel preset change
  const handleLabKernelPreset = (presetKey) => {
    const preset = LAB_KERNEL_PRESETS[presetKey]
    if (!preset) return
    
    setLabKernelPreset(presetKey)
    setLabKernel([...preset.kernel])
    
    if (labImageData) {
      processLabImage(labImageData, preset.kernel, labNormalize)
    }
  }
  
  // Handle custom kernel edit
  const handleLabKernelEdit = (index, delta) => {
    const newKernel = [...labKernel]
    newKernel[index] = Math.max(-9, Math.min(9, newKernel[index] + delta))
    setLabKernel(newKernel)
    setLabKernelPreset('custom')  // Mark as custom
    
    if (labImageData) {
      processLabImage(labImageData, newKernel, labNormalize)
    }
  }
  
  // Handle normalize toggle
  const handleLabNormalizeToggle = () => {
    const newNormalize = !labNormalize
    setLabNormalize(newNormalize)
    
    if (labImageData) {
      processLabImage(labImageData, labKernel, newNormalize)
    }
  }
  
  // Get current bio-bridge text
  const labBioText = labKernelPreset === 'custom' 
    ? 'Custom kernel — experiment to see what features emerge.'
    : LAB_KERNEL_PRESETS[labKernelPreset]?.description || LAB_BIO_BRIDGE.none
  
  // ============================================
  // CLASSIFIER DEMO HANDLERS
  // ============================================
  
  // Handle classifier image upload
  const handleClassifierImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setClassifierImage(dataUrl)
      setClassifierResult(null)
      setClassifierPreview(null)
      
      // Create image element for processing
      const img = new Image()
      img.onload = () => {
        setClassifierImageEl(img)
        
        // Generate 28x28 preview
        const preprocessed = preprocessForClassification(img)
        const previewCanvas = document.createElement('canvas')
        previewCanvas.width = 28
        previewCanvas.height = 28
        const ctx = previewCanvas.getContext('2d')
        ctx.putImageData(preprocessed, 0, 0)
        setClassifierPreview(previewCanvas.toDataURL())
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }
  
  // Run classification
  const handleRunClassifier = async () => {
    if (!classifierImageEl) return
    
    setClassifierRunning(true)
    setClassifierResult(null)
    
    try {
      // Preprocess to 28x28 grayscale
      const preprocessed = preprocessForClassification(classifierImageEl)
      
      const result = await classifyDigitImpl(preprocessed)
      setClassifierResult(result)
    } catch (error) {
      console.error('Classification error:', error)
      setClassifierResult({ label: '?', confidence: 0, allScores: Array(10).fill(0.1), error: true })
    } finally {
      setClassifierRunning(false)
    }
  }
  
  // Clear classifier state
  const handleClassifierClear = () => {
    setClassifierImage(null)
    setClassifierImageEl(null)
    setClassifierPreview(null)
    setClassifierResult(null)
    if (classifierFileInputRef.current) {
      classifierFileInputRef.current.value = ''
    }
  }
  
  // ============================================
  // GRID INTERACTIONS (with causal tracking)
  // ============================================
  
  const toggleCell = (index) => {
    const newGrid = [...grid]
    newGrid[index] = newGrid[index] === 0 ? 1 : 0
    setGrid(newGrid)
    setCurrentPreset(null)
    
    // Mark interaction for current view
    if (viewMode === 'one') setSingleHasInteracted(true)
    if (viewMode === 'many') {
      setManyHasInteracted(true)
      setManyInteractionCount(prev => prev + 1)
    }
  }
  
  const toggleSilence = (key) => {
    if (dropoutMode) return
    setSilencedNeurons(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const presets = {
    clear: [0,0,0, 0,0,0, 0,0,0],
    verticalLeft: [1,0,0, 1,0,0, 1,0,0],
    verticalRight: [0,0,1, 0,0,1, 0,0,1],
    horizontalTop: [1,1,1, 0,0,0, 0,0,0],
    horizontalBot: [0,0,0, 0,0,0, 1,1,1],
    diagonal: [1,0,0, 0,1,0, 0,0,1],
    antiDiag: [0,0,1, 0,1,0, 1,0,0],
    cross: [0,1,0, 1,1,1, 0,1,0],
  }
  
  const loadPreset = (name) => {
    setGrid([...presets[name]])
    setCurrentPreset(name)
    
    // Mark interaction
    if (viewMode === 'one') setSingleHasInteracted(true)
    if (viewMode === 'many') {
      setManyHasInteracted(true)
      setManyInteractionCount(prev => prev + 1)
    }
    
    if (dropoutMode) {
      const keys = Object.keys(NEURON_CONFIGS)
      setDropoutTarget(keys[Math.floor(Math.random() * keys.length)])
    }
  }
  
  useEffect(() => {
    if (!dropoutMode) setDropoutTarget(null)
  }, [dropoutMode])
  
  // ============================================
  // ACTIVATION SWITCH RESETS STATE (Priority 3)
  // ============================================
  
  const handleOutputModeSwitch = (newMode) => {
    if (newMode === outputMode) return
    // Don't reset state - let students compare modes with same inputs
    setOutputMode(newMode)
  }
  
  // ============================================
  // CONVOLUTION INTERACTIONS (Explicit Kernel)
  // ============================================

  const toggleConvCell = (index) => {
    const newImage = [...convImage]
    newImage[index] = newImage[index] === 0 ? 1 : 0
    setConvImage(newImage)
    // Recompute stored output for current position when image changes
    const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
    const newField = getReceptiveFieldValues(newImage, receptiveFieldPos.row, receptiveFieldPos.col)
    const newSum = computeWeightedSum(newField, kernel)
    setStoredOutputs(prev => ({ ...prev, [posKey]: newSum }))
  }

  const updateKernelValue = (index, delta) => {
    const newKernel = [...kernel]
    newKernel[index] = Math.max(-9, Math.min(9, newKernel[index] + delta))
    setKernel(newKernel)
    // Recompute stored output for current position when kernel changes
    const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
    const field = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
    const newSum = computeWeightedSum(field, newKernel)
    setStoredOutputs(prev => ({ ...prev, [posKey]: newSum }))
  }
  
  
  const loadKernelPreset = (presetName) => {
    const preset = KERNEL_PRESETS[presetName]
    if (preset) {
      setKernel([...preset])
      // Recompute current position
      const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
      const field = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
      const newSum = computeWeightedSum(field, preset)
      setStoredOutputs(prev => ({ ...prev, [posKey]: newSum }))
    }
  }

  const moveReceptiveField = (row, col) => {
    if (row < 0 || row > 2 || col < 0 || col > 2 || isAnimating) return
    
    setIsAnimating(true)
    setReceptiveFieldPos({ row, col })
    
    // Compute and store the output for this position
    const posKey = `${row},${col}`
    const field = getReceptiveFieldValues(convImage, row, col)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs(prev => ({ ...prev, [posKey]: sum }))
    
    // Brief animation delay
    setTimeout(() => setIsAnimating(false), 300)
  }

  const resetConvolution = () => {
    setReceptiveFieldPos({ row: 0, col: 0 })
    setStoredOutputs({})
    // Compute initial position
    const field = getReceptiveFieldValues(convImage, 0, 0)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs({ '0,0': sum })
  }
  
  // Initialize first position on mount or when entering convolution view
  useEffect(() => {
    if (viewMode === 'scanning' && Object.keys(storedOutputs).length === 0) {
      const field = getReceptiveFieldValues(convImage, 0, 0)
      const sum = computeWeightedSum(field, kernel)
      setStoredOutputs({ '0,0': sum })
    }
  }, [viewMode])

  // Current position calculations
  const currentReceptiveField = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
  const convSum = computeWeightedSum(currentReceptiveField, kernel)
  
  // Element-wise products for visualization
  const elementProducts = currentReceptiveField.map((val, i) => ({
    input: val,
    weight: kernel[i],
    product: val * kernel[i]
  }))
  
  // ============================================
  // SINGLE NEURON CALCULATIONS
  // ============================================
  
  const singleSum = computeWeightedSum(grid, SINGLE_WEIGHTS)
  const singleOutput = computeOutput(singleSum, THRESHOLD, outputMode)
  const singleFires = singleOutput > 0 // For visual purposes
  
  // ============================================
  // MULTI NEURON CALCULATIONS
  // ============================================
  
  const getEffectiveSilence = (key) => {
    if (dropoutMode && dropoutTarget === key) return true
    if (!dropoutMode && silencedNeurons[key]) return true
    return false
  }
  
  const neuronOutputs = Object.entries(NEURON_CONFIGS).map(([key, config]) => {
    const sum = computeWeightedSum(grid, config.weights)
    const isSilenced = getEffectiveSilence(key)
    const output = isSilenced ? 0 : computeActivation(sum, THRESHOLD, 'relu')
    return { key, ...config, sum, output, isSilenced }
  })
  
  const activeOutputs = neuronOutputs.filter(n => !n.isSilenced)
  const maxOutput = activeOutputs.length > 0 ? Math.max(...activeOutputs.map(n => n.output)) : 0
  const dominantNeuron = maxOutput > 0 ? activeOutputs.find(n => n.output === maxOutput)?.key : null
  
  // Soft reveal available after sufficient observation (5+ interactions)
  const canShowInsights = manyInteractionCount >= 5
  
  // ============================================
  // GSAP ANIMATIONS
  // ============================================
  
  const neuronRadius = 50
  const maxFillHeight = neuronRadius * 2 * 0.85
  
  // Single neuron animation
  useEffect(() => {
    if (viewMode !== 'one') return
    const fillRatio = Math.min(1, singleSum / (THRESHOLD * 1.5))
    const fillHeight = maxFillHeight * fillRatio
    const fillTopY = 200 + neuronRadius - fillHeight
    
    if (somaFillRef.current) {
      gsap.to(somaFillRef.current, { attr: { y: fillTopY, height: Math.max(0, fillHeight) }, duration: 0.25, ease: 'power2.out' })
    }
    if (somaFillLineRef.current) {
      gsap.to(somaFillLineRef.current, { attr: { y1: fillTopY, y2: fillTopY }, duration: 0.25, ease: 'power2.out' })
    }
  }, [singleSum, viewMode])
  
  // Multi neuron animation
  useEffect(() => {
    if (viewMode !== 'many') return
    neuronOutputs.forEach(({ key, sum, isSilenced }) => {
      const ref = somaFillRefs.current[key]
      if (!ref) return
      const effectiveSum = isSilenced ? 0 : sum
      const fillRatio = Math.min(1, effectiveSum / (THRESHOLD * 1.5))
      const fillHeight = maxFillHeight * fillRatio
      const fillTopY = 200 + neuronRadius - fillHeight
      gsap.to(ref, { attr: { y: fillTopY, height: Math.max(0, fillHeight) }, duration: 0.25, ease: 'power2.out' })
    })
  }, [grid, viewMode, silencedNeurons, dropoutTarget])
  
  
  // ============================================
  // LAYOUT
  // ============================================
  
  const svgWidth = 800
  const svgHeight = 420
  const gridStartX = 60
  const gridStartY = 120
  const cellSize = 44
  
  // Convolution layout
  const convCellSize = 38
  const convGridStartX = 50
  const convGridStartY = 100
  const convNeuronX = 420
  const convNeuronY = 200
  const outputGridStartX = 580
  const outputGridStartY = 140
  const outputCellSize = 50
  
  // Transition view constants
  const transNeuronRadius = 50
  const transNeuronCenterX = 400
  const transNeuronCenterY = 180
  const transThresholdRadius = transNeuronRadius * 0.72
  
  // ============================================
  // UNIFIED CONTAINER
  // ============================================
  
  return (
    <div className="module2-page">
      {/* Header */}
      <header className="module2-header">
        <div className="module2-header-row">
          <div className="module2-header-left">
            <span className="module2-header-badge">02</span>
            <div>
              <h1 className="module2-title">Perception &amp; Response</h1>
              <p className="module2-header-sub">~22 min · Pattern Recognition</p>
            </div>
          </div>
          <div className="module2-header-right">
            <TimeIndicator minutes={22} label="Perception & Response" active />
            <button className="shared-btn shared-btn-ghost shared-btn-sm" onClick={handlePrevStep}>Back</button>
            <button className="shared-btn shared-btn-primary shared-btn-sm" onClick={handleNextStep}>Next</button>
          </div>
        </div>
        <div className="module2-tabs">
          {VIEW_MODES.map(({ id, label, tooltip }) => {
            const isEnabled = enabledViews.includes(id)
            return (
              <button
                key={id}
                className={`module2-tab${viewMode === id ? ' active' : ''}`}
                onClick={() => isEnabled && handleViewModeChange(id)}
                disabled={!isEnabled}
                title={tooltip}
              >
                {label}
              </button>
            )
          })}
        </div>
        <ProgressRail currentModule="module2" />
      </header>

      {/* 3D Hero + guidance */}
      <div className="module2-hero">
        <div className="module2-hero-inner">
          <div className="module2-hero-text">
            <p className="module2-hero-kicker">Module 2</p>
            <h2>{currentStepConfig.title}</h2>
            <p>{currentStepConfig.guidance}</p>
            <div className="module2-hero-meta">
              <span className="module2-hero-step-chip">Step {stepIndex + 1} of {STEP_REGISTRY.length}</span>
            </div>
          </div>
          <Suspense fallback={<div className="module2-hero-3d-fallback" />}>
            <PatternGrid3D height={280} />
          </Suspense>
        </div>
      </div>
      
      {/* Hubel & Wiesel Story — above main content */}
      <div style={{ margin: '0 auto', maxWidth: 1180, padding: '24px 24px 0' }}>
        <HubelWieselStory />
      </div>

      <div className="module2-main">

      {/* TRANSITION VIEW */}
      {viewMode === 'transition' && (
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          minHeight: 'calc(100vh - 100px)'
        }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', textAlign: 'center' }}>
            This neuron adds incoming signals.
          </p>
          
          <svg width={800} height={360} style={{ display: 'block' }}>
            <defs>
              <radialGradient id="somaGradientTrans" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ECFDF5" />
                <stop offset="70%" stopColor="#D1FAE5" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </radialGradient>
              <clipPath id="somaClipTrans">
                <circle cx={transNeuronCenterX} cy={transNeuronCenterY} r={transNeuronRadius - 2} />
              </clipPath>
            </defs>
            
            {/* Input pattern (3x3 grid) */}
            <g transform="translate(120, 100)">
              <text x={60} y={-10} textAnchor="middle" fontSize="13" fontWeight="600" fill="#475569">Inputs</text>
              {currentArrangement.inputs.map((val, idx) => {
                const row = Math.floor(idx / 3)
                const col = idx % 3
                const x = col * 44
                const y = row * 44
                const hasSignal = val > 0
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width={40} height={40} rx={6} fill={hasSignal ? '#3B82F6' : '#F1F5F9'} stroke={hasSignal ? '#2563EB' : '#E2E8F0'} strokeWidth={2} />
                    <text x={x + 20} y={y + 25} textAnchor="middle" fontSize="14" fontWeight="600" fill={hasSignal ? 'white' : '#94A3B8'}>{val}</text>
                  </g>
                )
              })}
            </g>
            
            {/* Connection */}
            <line x1={260} y1={transNeuronCenterY} x2={transNeuronCenterX - transNeuronRadius - 10} y2={transNeuronCenterY} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="6 4" />
            <polygon points={`${transNeuronCenterX - transNeuronRadius - 10},${transNeuronCenterY - 6} ${transNeuronCenterX - transNeuronRadius - 10},${transNeuronCenterY + 6} ${transNeuronCenterX - transNeuronRadius},${transNeuronCenterY}`} fill="#CBD5E1" />
            <text x={310} y={transNeuronCenterY - 30} textAnchor="middle" fontSize="12" fill="#64748B">sum = {transitionTotal}</text>
            
            {/* Neuron */}
            <circle cx={transNeuronCenterX} cy={transNeuronCenterY} r={transNeuronRadius} fill="url(#somaGradientTrans)" stroke={transitionFires ? '#047857' : '#065F46'} strokeWidth={transitionFires ? 3.5 : 2.5} />
            <circle cx={transNeuronCenterX} cy={transNeuronCenterY} r={transNeuronRadius - 4} fill="none" stroke="#A7F3D0" strokeWidth={1} opacity={0.5} />
            <rect ref={transitionFillRef} x={transNeuronCenterX - transNeuronRadius} y={transNeuronCenterY + transNeuronRadius} width={transNeuronRadius * 2} height={0} fill={transitionFires ? '#10B981' : '#34D399'} clipPath="url(#somaClipTrans)" opacity={0.85} />
            <line ref={transitionFillLineRef} x1={transNeuronCenterX - transNeuronRadius + 10} x2={transNeuronCenterX + transNeuronRadius - 10} y1={transNeuronCenterY + transNeuronRadius} y2={transNeuronCenterY + transNeuronRadius} stroke="#059669" strokeWidth={1.5} clipPath="url(#somaClipTrans)" opacity={0.6} />
            <circle cx={transNeuronCenterX} cy={transNeuronCenterY} r={transThresholdRadius} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" opacity={transitionFires ? 0.35 : 0.55} />
            <text x={transNeuronCenterX} y={transNeuronCenterY + 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1E293B">Σ={transitionTotal}</text>
            
            {/* Output */}
            <line x1={transNeuronCenterX + transNeuronRadius} y1={transNeuronCenterY} x2={540} y2={transNeuronCenterY} stroke={transitionFires ? '#10B981' : '#94A3B8'} strokeWidth={transitionFires ? 4 : 2.5} strokeLinecap="round" />
            <g transform={`translate(580, ${transNeuronCenterY})`}>
              <motion.circle cx={0} cy={0} r={transitionFires ? 28 : 20} fill={transitionFires ? '#D1FAE5' : '#F1F5F9'} stroke={transitionFires ? '#10B981' : '#E2E8F0'} strokeWidth={3} initial={false} animate={{ r: transitionFires ? 28 : 20 }} transition={{ duration: 0.25 }} />
              <text x={0} y={6} textAnchor="middle" fontSize="20" fontWeight="700" fill={transitionFires ? '#047857' : '#94A3B8'}>{transitionFires ? '⚡' : '○'}</text>
              <text x={0} y={50} textAnchor="middle" fontSize="12" fontWeight="600" fill={transitionFires ? '#047857' : '#94A3B8'}>{transitionFires ? 'FIRES' : 'Silent'}</text>
            </g>
          </svg>
          
          <button 
            onClick={cycleArrangement} 
            style={{ 
              marginTop: '16px', 
              padding: '8px 20px', 
              fontSize: '13px', 
              fontWeight: '500', 
              color: '#3B82F6', 
              backgroundColor: '#EFF6FF', 
              border: '1px solid #BFDBFE', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontFamily: 'system-ui, sans-serif' 
            }}
          >
            Change arrangement
          </button>
          
          <AnimatePresence>
            {hasSeenMultiple && (
              <>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={{ marginTop: '28px', fontSize: '16px', fontWeight: '500', color: '#475569', textAlign: 'center' }}>
                  It knows <em>how much</em> signal there is — not <em>where</em> it comes from.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 0.4, delay: 0.8 }} 
                  style={{ 
                    marginTop: '16px', 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: '#3B82F6', 
                    textAlign: 'center'
                  }}
                >
                  So how do brains tell "where" something is? →
                </motion.p>
              </>
            )}
          </AnimatePresence>
        </main>
      )}
      
      {/* ============================================ */}
      {/* LAB VIEW - Full Implementation */}
      {/* ============================================ */}
      {viewMode === 'lab' && (
        <main style={{ padding: '16px 24px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Lab internal tabs - secondary nav, uses purple to distinguish from main nav */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
              <button
                onClick={() => setLabTab('kernels')}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: labTab === 'kernels' ? 'white' : '#64748B',
                  backgroundColor: labTab === 'kernels' ? '#8B5CF6' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                🔬 Kernels
              </button>
              <button
                onClick={() => setLabTab('classifier')}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: labTab === 'classifier' ? 'white' : '#64748B',
                  backgroundColor: labTab === 'classifier' ? '#8B5CF6' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                🧠 Classifier Demo
              </button>
            </div>
          </div>
          
          {/* KERNELS TAB */}
          {labTab === 'kernels' && (
            <>
              {/* Three-panel layout */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 280px 1fr', 
                gap: '20px',
                alignItems: 'start',
                marginBottom: '16px'
              }}>
                {/* LEFT: Original Image */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  minHeight: '340px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#475569', margin: '0 0 12px 0', textAlign: 'center' }}>
                    Original Image
                  </h3>
                  
                  {!labImage ? (
                    <div 
                      onClick={() => labFileInputRef.current?.click()}
                      style={{ 
                        border: '2px dashed #CBD5E1', 
                        borderRadius: '8px', 
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#F8FAFC',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📷</p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: '0 0 4px 0' }}>
                        Click to upload an image
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                        JPG, PNG, or GIF
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={labImage} 
                        alt="Original" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '280px', 
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0'
                        }} 
                      />
                      <button
                        onClick={() => labFileInputRef.current?.click()}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: '#64748B',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Change image
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={labFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLabImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                
                {/* CENTER: Kernel Controls */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid #E2E8F0'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#475569', margin: '0 0 12px 0', textAlign: 'center' }}>
                    Kernel (3×3)
                  </h3>
                  
                  {/* Kernel preset selector */}
                  <div style={{ marginBottom: '12px' }}>
                    <select
                      value={labKernelPreset}
                      onChange={(e) => handleLabKernelPreset(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#1E293B',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {Object.entries(LAB_KERNEL_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.name}</option>
                      ))}
                      {labKernelPreset === 'custom' && <option value="custom">Custom</option>}
                    </select>
                  </div>
                  
                  {/* 3x3 Kernel grid editor */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    {labKernel.map((value, idx) => (
                      <div 
                        key={idx}
                        style={{
                          position: 'relative',
                          backgroundColor: value > 0 ? '#DCFCE7' : value < 0 ? '#FEE2E2' : '#F1F5F9',
                          border: `2px solid ${value > 0 ? '#22C55E' : value < 0 ? '#EF4444' : '#CBD5E1'}`,
                          borderRadius: '6px',
                          padding: '8px 4px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: value > 0 ? '#166534' : value < 0 ? '#991B1B' : '#64748B'
                        }}>
                          {value}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
                          <button
                            onClick={() => handleLabKernelEdit(idx, -1)}
                            style={{
                              width: '24px',
                              height: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#64748B',
                              backgroundColor: '#E2E8F0',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            −
                          </button>
                          <button
                            onClick={() => handleLabKernelEdit(idx, 1)}
                            style={{
                              width: '24px',
                              height: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#64748B',
                              backgroundColor: '#E2E8F0',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Normalize toggle */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>
                      Normalize (for blur)
                    </span>
                    <button
                      onClick={handleLabNormalizeToggle}
                      style={{
                        width: '40px',
                        height: '22px',
                        borderRadius: '11px',
                        border: 'none',
                        backgroundColor: labNormalize ? '#8B5CF6' : '#CBD5E1',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: labNormalize ? '20px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                  
                  {/* Kernel sum info */}
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '8px 0 0 0', textAlign: 'center' }}>
                    Kernel sum: {labKernel.reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                
                {/* RIGHT: Processed Image */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  minHeight: '340px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#475569', margin: '0 0 12px 0', textAlign: 'center' }}>
                    Processed Output
                  </h3>
                  
                  {!labImage ? (
                    <div style={{ 
                      border: '2px dashed #E2E8F0', 
                      borderRadius: '8px', 
                      padding: '40px 20px',
                      textAlign: 'center',
                      backgroundColor: '#FAFAFA'
                    }}>
                      <p style={{ fontSize: '32px', margin: '0 0 8px 0', opacity: 0.5 }}>🖼️</p>
                      <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                        Upload an image to see output
                      </p>
                    </div>
                  ) : labProcessing ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      minHeight: '200px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#64748B' }}>Processing...</p>
                    </div>
                  ) : labProcessedUrl ? (
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={labProcessedUrl} 
                        alt="Processed" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '280px', 
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0'
                        }} 
                      />
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '8px 0 0 0' }}>
                        {labImageSize.width} × {labImageSize.height} px (grayscale)
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
              
              {/* Bio-bridge explanation */}
              <div style={{ 
                backgroundColor: '#F0FDF4', 
                border: '1px solid #86EFAC', 
                borderRadius: '10px',
                padding: '14px 20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#166534', margin: 0 }}>
                  🧠 {labBioText}
                </p>
                <p style={{ fontSize: '12px', color: '#15803D', margin: '6px 0 0 0' }}>
                  The kernel (weights) slides across every location — this is scanning/convolution.
                </p>
              </div>
            </>
          )}
          
          {/* CLASSIFIER DEMO TAB */}
          {labTab === 'classifier' && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {/* LEFT: Upload & Preview */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '20px',
                border: '1px solid #E2E8F0'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: '0 0 16px 0', textAlign: 'center' }}>
                  📷 Upload Image
                </h3>
                
                {/* Model selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    Recognition Type
                  </label>
                  <select
                    value={classifierModel}
                    onChange={(e) => setClassifierModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#1E293B',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="digits">Digits (0–9)</option>
                  </select>
                </div>
                
                {/* File upload */}
                <input
                  ref={classifierFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleClassifierImageUpload}
                  style={{ display: 'none' }}
                />
                
                {!classifierImage ? (
                  <button
                    onClick={() => classifierFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '40px 20px',
                      backgroundColor: '#F8FAFC',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>📤</p>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#64748B', margin: 0 }}>
                      Click to upload an image
                    </p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                      JPG, PNG, or any image format
                    </p>
                  </button>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={classifierImage} 
                      alt="Upload" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '140px', 
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        marginBottom: '12px'
                      }} 
                    />
                    
                    {/* 28x28 preview */}
                    {classifierPreview && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 6px 0' }}>
                          Pre-processed (28×28):
                        </p>
                        <img 
                          src={classifierPreview} 
                          alt="28x28 preview" 
                          style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '4px',
                            border: '1px solid #E2E8F0',
                            imageRendering: 'pixelated'
                          }} 
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => classifierFileInputRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#64748B',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Change
                      </button>
                      <button
                        onClick={handleClassifierClear}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#EF4444',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Run button */}
                <button
                  onClick={handleRunClassifier}
                  disabled={!classifierImageEl || classifierRunning}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: (!classifierImageEl || classifierRunning) ? '#CBD5E1' : '#8B5CF6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (!classifierImageEl || classifierRunning) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {classifierRunning ? '⏳ Running...' : '🧠 Run on Device'}
                </button>
                
                {/* Privacy note */}
                <p style={{ 
                  fontSize: '10px', 
                  color: '#94A3B8', 
                  margin: '8px 0 0 0', 
                  textAlign: 'center' 
                }}>
                  🔒 100% local — your image never leaves your device
                </p>
              </div>
              
              {/* RIGHT: Results */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '20px',
                border: '1px solid #E2E8F0'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: '0 0 16px 0', textAlign: 'center' }}>
                  🎯 Prediction
                </h3>
                
                {!classifierResult && !classifierRunning && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#94A3B8'
                  }}>
                    <p style={{ fontSize: '48px', margin: '0 0 12px 0', opacity: 0.3 }}>🔢</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      Upload an image and click "Run on Device"
                    </p>
                  </div>
                )}
                
                {classifierRunning && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px'
                  }}>
                    <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>⏳</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                      Processing...
                    </p>
                  </div>
                )}
                
                {classifierResult && !classifierRunning && (
                  <div>
                    {/* Main prediction */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '10px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ fontSize: '64px', fontWeight: '700', color: '#166534', margin: '0 0 8px 0' }}>
                        {classifierResult.label}
                      </p>
                      <p style={{ fontSize: '13px', color: '#15803D', margin: 0 }}>
                        Confidence: {(classifierResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    {/* All scores */}
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', margin: '0 0 8px 0' }}>
                        All predictions:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {classifierResult.allScores.map((score, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              color: idx === parseInt(classifierResult.label) ? '#166534' : '#64748B',
                              width: '16px'
                            }}>
                              {idx}
                            </span>
                            <div style={{ 
                              flex: 1, 
                              height: '14px', 
                              backgroundColor: '#F1F5F9', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${score * 100}%`,
                                height: '100%',
                                backgroundColor: idx === parseInt(classifierResult.label) ? '#22C55E' : '#94A3B8',
                                borderRadius: '4px',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#94A3B8', 
                              width: '32px', 
                              textAlign: 'right' 
                            }}>
                              {(score * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Demo notice */}
                    <div style={{ 
                      marginTop: '16px',
                      padding: '10px 12px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: '6px'
                    }}>
                      <p style={{ fontSize: '11px', color: '#92400E', margin: 0, textAlign: 'center' }}>
                        ⚠️ Demo mode: Results are simulated. Real digit recognition coming soon!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bio-bridge for classifier */}
          {labTab === 'classifier' && (
            <div style={{ 
              backgroundColor: '#EDE9FE', 
              border: '1px solid #C4B5FD', 
              borderRadius: '10px',
              padding: '14px 20px',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#5B21B6', margin: 0 }}>
                🧠 A trained network has learned which kernel patterns respond to each digit.
              </p>
              <p style={{ fontSize: '12px', color: '#7C3AED', margin: '6px 0 0 0' }}>
                It combines thousands of neurons with learned weights — the same principle as your single neuron!
              </p>
            </div>
          )}
        </main>
      )}
      
      {/* ============================================ */}
      {/* ONE / MANY / SCANNING VIEWS */}
      {/* ============================================ */}
      {(viewMode === 'one' || viewMode === 'many' || viewMode === 'scanning') && (
      
      <main style={{ padding: '24px', maxWidth: '950px', margin: '0 auto' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 6px 0' }}>
            {viewMode === 'one' && 'One Neuron + Weights = Selectivity'}
            {viewMode === 'many' && 'Three Neurons, Different Weights'}
            {viewMode === 'scanning' && 'Same Weights, Different Locations'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            {viewMode === 'one' && 'Weights make some inputs count more than others.'}
            {viewMode === 'many' && 'Each neuron has different weights → responds to different patterns.'}
            {viewMode === 'scanning' && 'The same kernel (weights) slides across the image — this is scanning.'}
          </p>
        </div>
        
        {/* Output mode selector (single view) - secondary controls use purple */}
        {viewMode === 'one' && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
              {[
                { key: 'yesno', label: 'Yes / No' },
                { key: 'smooth', label: 'Smooth' },
                { key: 'proportional', label: 'Proportional' }
              ].map(({ key, label }) => (
                <button 
                  key={key} 
                  onClick={() => handleOutputModeSwitch(key)} 
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '13px', 
                    fontWeight: '500', 
                    color: outputMode === key ? 'white' : '#64748B', 
                    backgroundColor: outputMode === key ? '#8B5CF6' : 'transparent', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontFamily: 'system-ui, sans-serif'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '6px 0 0 0', fontFamily: 'system-ui, sans-serif' }}>
              Same inputs and weights — only the decision rule changes.
            </p>
          </div>
        )}
        
        {/* Dropout toggle and Insights reveal (many view) */}
        {viewMode === 'many' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <button 
              onClick={() => setDropoutMode(!dropoutMode)} 
              style={{ 
                padding: '6px 14px', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: dropoutMode ? 'white' : '#64748B', 
                backgroundColor: dropoutMode ? '#F97316' : '#F1F5F9', 
                border: dropoutMode ? 'none' : '1px solid #E2E8F0', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              {dropoutMode ? '⚡ Random Silence ON' : '○ Random Silence OFF'}
            </button>
            
            {/* Soft reveal toggle - only appears after sufficient observation */}
            {canShowInsights && (
              <button 
                onClick={() => setShowInsights(!showInsights)} 
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: showInsights ? '#5B21B6' : '#64748B', 
                  backgroundColor: showInsights ? '#EDE9FE' : '#F8FAFC', 
                  border: `1px solid ${showInsights ? '#C4B5FD' : '#E2E8F0'}`, 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {showInsights ? '✓ Showing why' : '? Show why'}
              </button>
            )}
          </div>
        )}
        
        {/* SVG Visualization */}
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <radialGradient id="somaGradient" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="70%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <radialGradient id="somaGradientDim" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
            <radialGradient id="somaGradientSilenced" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>
          
          {/* ===== SINGLE NEURON VIEW ===== */}
          {viewMode === 'one' && (
            <>
              <g id="inputGrid">
                <text x={gridStartX + cellSize * 1.5} y={gridStartY - 25} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1E293B">Input Pattern</text>
                {grid.map((val, i) => {
                  const row = Math.floor(i / 3), col = i % 3
                  const x = gridStartX + col * cellSize, y = gridStartY + row * cellSize
                  return (
                    <g key={i} style={{ cursor: 'pointer' }} onClick={() => toggleCell(i)}>
                      <rect x={x} y={y} width={cellSize - 4} height={cellSize - 4} rx={5} fill={val ? '#3B82F6' : '#F1F5F9'} stroke={val ? '#2563EB' : '#E2E8F0'} strokeWidth={2} />
                      <text x={x + (cellSize - 4) / 2} y={y + (cellSize - 4) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill={val ? 'white' : '#94A3B8'}>{val}</text>
                    </g>
                  )
                })}
                <text x={gridStartX + cellSize * 1.5} y={gridStartY + cellSize * 3 + 18} textAnchor="middle" fontSize="10" fill="#94A3B8">click to toggle</text>
              </g>
              
              <g id="connections">
                {grid.map((val, i) => {
                  const row = Math.floor(i / 3), col = i % 3
                  const startX = gridStartX + col * cellSize + (cellSize - 4) / 2
                  const startY = gridStartY + row * cellSize + (cellSize - 4) / 2
                  return <path key={i} d={`M ${startX + 20} ${startY} Q ${(startX + 400) / 2 + 20} ${startY}, ${400} ${200 - 20 + row * 20}`} fill="none" stroke={val ? '#3B82F6' : '#E2E8F0'} strokeWidth={val ? 2 : 1} opacity={val ? 0.6 : 0.25} />
                })}
              </g>
              
              <g id="singleNeuron">
                <clipPath id="somaClipSingle"><circle cx={450} cy={200} r={neuronRadius - 2} /></clipPath>
                <circle cx={450} cy={200} r={neuronRadius} fill="url(#somaGradient)" stroke={singleHasInteracted && singleFires ? '#047857' : '#065F46'} strokeWidth={singleHasInteracted && singleFires ? 3 : 2} />
                {/* Neuron fill only visible after interaction */}
                {singleHasInteracted && (
                  <>
                    <rect ref={somaFillRef} x={400} y={250} width={100} height={0} fill={singleFires ? '#10B981' : '#34D399'} clipPath="url(#somaClipSingle)" opacity={0.8} />
                    <line ref={somaFillLineRef} x1={408} x2={492} y1={250} y2={250} stroke="#059669" strokeWidth={1.5} clipPath="url(#somaClipSingle)" opacity={0.5} />
                  </>
                )}
                <circle cx={450} cy={200} r={neuronRadius * 0.72} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="5 3" opacity={singleHasInteracted && singleFires ? 0.3 : 0.55} />
                <text x={450} y={188 - neuronRadius} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1E293B">Neuron</text>
                {/* Sum hidden until interaction */}
                <text x={450} y={228 + neuronRadius} textAnchor="middle" fontSize="12" fill="#1E293B">
                  sum = <tspan fontWeight="700">{singleHasInteracted ? singleSum : '?'}</tspan>
                </text>
              </g>
              
              {/* Output visualization - changes based on mode */}
              <g id="output" opacity={singleHasInteracted ? 1 : 0.3}>
                <line x1={500} y1={200} x2={550} y2={200} stroke={singleHasInteracted && singleOutput > 0 ? '#10B981' : '#CBD5E1'} strokeWidth={2} />
                
                {/* YES/NO MODE: Binary circle that snaps on/off */}
                {outputMode === 'yesno' && (
                  <>
                    <circle 
                      cx={580} cy={200} 
                      r={singleHasInteracted && singleOutput ? 22 : 14} 
                      fill={singleHasInteracted && singleOutput ? '#10B981' : '#F1F5F9'} 
                      stroke={singleHasInteracted && singleOutput ? '#047857' : '#CBD5E1'} 
                      strokeWidth={2} 
                    />
                    <text x={580} y={206} textAnchor="middle" fontSize="18" fontWeight="700" fill={singleHasInteracted && singleOutput ? 'white' : '#94A3B8'}>
                      {singleHasInteracted ? (singleOutput ? '1' : '0') : '?'}
                    </text>
                    <text x={580} y={235} textAnchor="middle" fontSize="9" fill="#64748B">
                      {singleHasInteracted ? (singleOutput ? 'YES' : 'NO') : ''}
                    </text>
                  </>
                )}
                
                {/* SMOOTH MODE: Gradient bar with percentage */}
                {outputMode === 'smooth' && (() => {
                  const barHeight = 70
                  const fillHeight = singleHasInteracted ? singleOutput * barHeight : 0
                  const fillColor = singleOutput > 0.5 ? '#10B981' : (singleOutput > 0 ? '#34D399' : '#E2E8F0')
                  return (
                    <>
                      {/* Background bar */}
                      <rect x={565} y={165} width={30} height={barHeight} fill="#F1F5F9" stroke="#E2E8F0" rx={4} />
                      {/* Fill bar */}
                      {singleHasInteracted && (
                        <rect 
                          x={565} 
                          y={165 + barHeight - fillHeight} 
                          width={30} 
                          height={fillHeight} 
                          fill={fillColor} 
                          rx={4} 
                        />
                      )}
                      {/* Percentage text */}
                      <text x={580} y={155} textAnchor="middle" fontSize="12" fontWeight="700" fill={singleOutput > 0.5 ? '#047857' : '#64748B'}>
                        {singleHasInteracted ? getDisplayOutput(singleOutput, 'smooth') : '?'}
                      </text>
                      {/* Gradient hint */}
                      <text x={580} y={250} textAnchor="middle" fontSize="9" fill="#94A3B8">
                        gradual
                      </text>
                    </>
                  )
                })()}
                
                {/* PROPORTIONAL MODE: Expanding indicator that can exceed 1 */}
                {outputMode === 'proportional' && (() => {
                  const maxVisualSize = 28
                  const minSize = 12
                  // Size scales with output, capped visually but showing overflow
                  const visualRatio = Math.min(1, singleOutput / 6)
                  const indicatorSize = singleHasInteracted ? minSize + visualRatio * (maxVisualSize - minSize) : minSize
                  const isOverflow = singleOutput > 6
                  const fillColor = singleOutput > 0 ? (isOverflow ? '#8B5CF6' : '#10B981') : '#F1F5F9'
                  const strokeColor = singleOutput > 0 ? (isOverflow ? '#6D28D9' : '#047857') : '#CBD5E1'
                  
                  return (
                    <>
                      {/* Expanding square indicator */}
                      <rect 
                        x={580 - indicatorSize / 2} 
                        y={200 - indicatorSize / 2} 
                        width={indicatorSize} 
                        height={indicatorSize} 
                        fill={singleHasInteracted ? fillColor : '#F1F5F9'}
                        stroke={singleHasInteracted ? strokeColor : '#CBD5E1'}
                        strokeWidth={2}
                        rx={4}
                      />
                      {/* Value text */}
                      <text x={580} y={205} textAnchor="middle" fontSize={indicatorSize > 20 ? "14" : "11"} fontWeight="700" fill={singleOutput > 0 ? 'white' : '#94A3B8'}>
                        {singleHasInteracted ? getDisplayOutput(singleOutput, 'proportional') : '?'}
                      </text>
                      {/* Overflow indicator */}
                      {singleHasInteracted && isOverflow && (
                        <text x={580} y={235} textAnchor="middle" fontSize="9" fill="#8B5CF6" fontWeight="600">
                          overflow!
                        </text>
                      )}
                      {/* Scale hint */}
                      <text x={580} y={isOverflow ? 248 : 235} textAnchor="middle" fontSize="9" fill="#94A3B8">
                        scales with sum
                      </text>
                    </>
                  )
                })()}
                
                <text x={580} y={268} textAnchor="middle" fontSize="10" fontWeight="500" fill="#475569">output</text>
              </g>
            </>
          )}
          
          {/* ===== MANY NEURONS VIEW ===== */}
          {viewMode === 'many' && (
            <>
              <g id="inputGrid">
                <text x={gridStartX + cellSize * 1.5} y={gridStartY - 25} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1E293B">Input Pattern</text>
                {grid.map((val, i) => {
                  const row = Math.floor(i / 3), col = i % 3
                  const x = gridStartX + col * cellSize, y = gridStartY + row * cellSize
                  return (
                    <g key={i} style={{ cursor: 'pointer' }} onClick={() => toggleCell(i)}>
                      <rect x={x} y={y} width={cellSize - 4} height={cellSize - 4} rx={5} fill={val ? '#3B82F6' : '#F1F5F9'} stroke={val ? '#2563EB' : '#E2E8F0'} strokeWidth={2} />
                      <text x={x + (cellSize - 4) / 2} y={y + (cellSize - 4) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill={val ? 'white' : '#94A3B8'}>{val}</text>
                    </g>
                  )
                })}
              </g>
              
              {neuronOutputs.map(({ key, isSilenced }, ni) => (
                <g key={`conn-${key}`} opacity={isSilenced ? 0.2 : 1}>
                  {grid.map((val, i) => {
                    const row = Math.floor(i / 3), col = i % 3
                    const startX = gridStartX + col * cellSize + (cellSize - 4) / 2
                    const startY = gridStartY + row * cellSize + (cellSize - 4) / 2
                    const neuronX = 320 + ni * 140
                    return <path key={`${key}-${i}`} d={`M ${startX + 20} ${startY} Q ${200 + ni * 20} ${startY}, ${neuronX - 45} ${200 - 15 + row * 15}`} fill="none" stroke={val ? '#94A3B8' : '#E2E8F0'} strokeWidth={1} opacity={val ? 0.4 : 0.15} />
                  })}
                </g>
              ))}
              
              {neuronOutputs.map(({ key, symbol, revealedName, sum, output, color, isSilenced }, ni) => {
                const neuronX = 320 + ni * 140
                const isDominant = key === dominantNeuron
                const fires = sum >= THRESHOLD && !isSilenced
                const effectiveSum = isSilenced ? 0 : sum
                const fillRatio = Math.min(1, effectiveSum / (THRESHOLD * 1.5))
                const fillHeight = maxFillHeight * fillRatio
                const fillTopY = 200 + neuronRadius - fillHeight
                
                // Response intensity determines visual prominence (no labels)
                const responseIntensity = Math.min(1, output / 6)
                const glowOpacity = manyHasInteracted ? (0.3 + responseIntensity * 0.5) : 0.2
                
                return (
                  <g key={key} opacity={isSilenced ? 0.4 : 1} style={{ cursor: dropoutMode ? 'default' : 'pointer' }} onClick={() => toggleSilence(key)}>
                    <clipPath id={`somaClip-${key}`}><circle cx={neuronX} cy={200} r={neuronRadius - 2} /></clipPath>
                    
                    {/* Glow effect based on response intensity */}
                    {manyHasInteracted && output > 0 && !isSilenced && (
                      <circle 
                        cx={neuronX} cy={200} 
                        r={neuronRadius + 8 + responseIntensity * 6} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth={2 + responseIntensity * 3} 
                        opacity={glowOpacity} 
                      />
                    )}
                    
                    {/* Neuron body */}
                    <circle 
                      cx={neuronX} cy={200} r={neuronRadius} 
                      fill={isSilenced ? 'url(#somaGradientSilenced)' : 'url(#somaGradient)'} 
                      stroke={isSilenced ? '#94A3B8' : (manyHasInteracted && output > 0 ? color : '#065F46')} 
                      strokeWidth={isSilenced ? 2 : (manyHasInteracted && output > 0 ? 2 + responseIntensity * 2 : 2)} 
                      strokeDasharray={isSilenced ? '4 4' : 'none'} 
                    />
                    
                    {/* Neuron fill - intensity shows response strength */}
                    {manyHasInteracted && !isSilenced && (
                      <rect 
                        ref={el => somaFillRefs.current[key] = el} 
                        x={neuronX - neuronRadius} y={fillTopY} 
                        width={neuronRadius * 2} height={fillHeight} 
                        fill={color} 
                        clipPath={`url(#somaClip-${key})`} 
                        opacity={0.5 + responseIntensity * 0.4} 
                      />
                    )}
                    
                    {/* Threshold line */}
                    <circle 
                      cx={neuronX} cy={200} r={neuronRadius * 0.72} 
                      fill="none" 
                      stroke={isSilenced ? '#94A3B8' : '#D97706'} 
                      strokeWidth={1.5} 
                      strokeDasharray="4 3" 
                      opacity={isSilenced ? 0.3 : (manyHasInteracted && fires ? 0.3 : 0.5)} 
                    />
                    
                    {/* Symbol: neutral identifier only (N₁, N₂, N₃) or X if silenced */}
                    {isSilenced 
                      ? <text x={neuronX} y={208} textAnchor="middle" fontSize="28" fontWeight="700" fill="#94A3B8">✕</text> 
                      : <text x={neuronX} y={206} textAnchor="middle" fontSize="22" fontWeight="700" fill={manyHasInteracted && output > 0 ? color : '#1E293B'}>{symbol}</text>
                    }
                    
                    {/* Label: only shown if insights are revealed */}
                    {showInsights && !isSilenced && (
                      <text x={neuronX} y={200 - neuronRadius - 14} textAnchor="middle" fontSize="10" fontWeight="500" fill={color} fontStyle="italic">
                        responds to {revealedName.toLowerCase()}
                      </text>
                    )}
                    
                    {/* Output bar - pure response visualization */}
                    <g opacity={manyHasInteracted ? (isSilenced ? 0.3 : 1) : 0.25}>
                      <rect x={neuronX - 10} y={260} width={20} height={55} fill="#F1F5F9" stroke="#E2E8F0" rx={4} />
                      {manyHasInteracted && (
                        <rect 
                          x={neuronX - 10} 
                          y={315 - Math.min(1, output * RELU_SCALE) * 55} 
                          width={20} 
                          height={Math.min(1, output * RELU_SCALE) * 55} 
                          fill={isSilenced ? '#94A3B8' : color} 
                          rx={4} 
                          opacity={isSilenced ? 0.4 : (0.6 + responseIntensity * 0.4)}
                        />
                      )}
                      <text x={neuronX} y={330} textAnchor="middle" fontSize="10" fontWeight="600" fill={manyHasInteracted && output > 0 ? color : '#94A3B8'}>
                        {manyHasInteracted ? output.toFixed(1) : '?'}
                      </text>
                    </g>
                    
                    {/* Status text - only "silenced" shown, no "strongest" */}
                    {isSilenced && <text x={neuronX} y={348} textAnchor="middle" fontSize="9" fontWeight="500" fill="#94A3B8">silenced</text>}
                  </g>
                )
              })}
            </>
          )}
          
          {/* ===== CONVOLUTION VIEW ===== */}
          {viewMode === 'scanning' && (() => {
            // Layout constants for convolution view
            const inputGridX = 30
            const inputGridY = 60
            const inputCellSz = 34
            const kernelGridX = 250
            const kernelGridY = 120
            const kernelCellSz = 44
            const productGridX = 430
            const productGridY = 120
            const productCellSz = 44
            const outputGridX = 640
            const outputGridY = 120
            const outputCellSz = 50
            
            return (
              <>
                {/* === INPUT IMAGE (5x5) === */}
                <g id="convInputImage">
                  <text x={inputGridX + inputCellSz * 2.5} y={inputGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Input (5×5)</text>
                  {convImage.map((val, i) => {
                    const row = Math.floor(i / 5), col = i % 5
                    const x = inputGridX + col * inputCellSz
                    const y = inputGridY + row * inputCellSz
                    const inReceptiveField = row >= receptiveFieldPos.row && row < receptiveFieldPos.row + 3 && col >= receptiveFieldPos.col && col < receptiveFieldPos.col + 3
                    
                    return (
                      <g key={i} style={{ cursor: 'pointer' }} onClick={() => toggleConvCell(i)}>
                        <rect 
                          x={x} y={y} 
                          width={inputCellSz - 2} height={inputCellSz - 2} 
                          rx={4} 
                          fill={inReceptiveField ? (val ? '#3B82F6' : '#EFF6FF') : (val ? '#64748B' : '#F8FAFC')} 
                          stroke={inReceptiveField ? '#8B5CF6' : (val ? '#475569' : '#E2E8F0')} 
                          strokeWidth={inReceptiveField ? 2 : 1} 
                        />
                        <text 
                          x={x + (inputCellSz - 2) / 2} 
                          y={y + (inputCellSz - 2) / 2 + 4} 
                          textAnchor="middle" 
                          fontSize="12" 
                          fontWeight={inReceptiveField ? "700" : "500"} 
                          fill={inReceptiveField ? (val ? 'white' : '#3B82F6') : (val ? 'white' : '#94A3B8')}
                        >
                          {val}
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Receptive field highlight */}
                  <rect 
                    x={inputGridX + receptiveFieldPos.col * inputCellSz - 3} 
                    y={inputGridY + receptiveFieldPos.row * inputCellSz - 3} 
                    width={inputCellSz * 3 + 4} 
                    height={inputCellSz * 3 + 4} 
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    rx={6} 
                  />
                  
                  <text x={inputGridX + inputCellSz * 2.5} y={inputGridY + inputCellSz * 5 + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">click to edit</text>
                </g>
                
                {/* === MULTIPLICATION SYMBOL === */}
                <text x={kernelGridX - 18} y={kernelGridY + kernelCellSz * 1.5 + 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#64748B">×</text>
                
                {/* === KERNEL (3x3) - EDITABLE === */}
                <g id="kernelGrid">
                  <text x={kernelGridX + kernelCellSz * 1.5} y={kernelGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#8B5CF6">Weights (3×3)</text>
                  {kernel.map((weight, i) => {
                    const row = Math.floor(i / 3), col = i % 3
                    const x = kernelGridX + col * kernelCellSz
                    const y = kernelGridY + row * kernelCellSz
                    const bgColor = weight > 0 ? '#DCFCE7' : (weight < 0 ? '#FEE2E2' : '#F8FAFC')
                    const borderColor = weight > 0 ? '#22C55E' : (weight < 0 ? '#EF4444' : '#CBD5E1')
                    const textColor = weight > 0 ? '#166534' : (weight < 0 ? '#991B1B' : '#64748B')
                    
                    return (
                      <g key={i}>
                        <rect 
                          x={x} y={y} 
                          width={kernelCellSz - 2} height={kernelCellSz - 2} 
                          rx={5} 
                          fill={bgColor} 
                          stroke={borderColor} 
                          strokeWidth={2} 
                        />
                        <text 
                          x={x + (kernelCellSz - 2) / 2} 
                          y={y + (kernelCellSz - 2) / 2 + 5} 
                          textAnchor="middle" 
                          fontSize="14" 
                          fontWeight="700" 
                          fill={textColor}
                        >
                          {weight > 0 ? `+${weight}` : weight}
                        </text>
                        {/* Up button */}
                        <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, 1)}>
                          <rect x={x + kernelCellSz - 14} y={y + 2} width={10} height={10} rx={2} fill="#E2E8F0" />
                          <text x={x + kernelCellSz - 9} y={y + 10} textAnchor="middle" fontSize="9" fill="#64748B">+</text>
                        </g>
                        {/* Down button */}
                        <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, -1)}>
                          <rect x={x + kernelCellSz - 14} y={y + kernelCellSz - 14} width={10} height={10} rx={2} fill="#E2E8F0" />
                          <text x={x + kernelCellSz - 9} y={y + kernelCellSz - 6} textAnchor="middle" fontSize="9" fill="#64748B">−</text>
                        </g>
                      </g>
                    )
                  })}
                  <text x={kernelGridX + kernelCellSz * 1.5} y={kernelGridY + kernelCellSz * 3 + 14} textAnchor="middle" fontSize="9" fill="#8B5CF6">click +/− to edit</text>
                </g>
                
                {/* === EQUALS SYMBOL === */}
                <text x={productGridX - 18} y={kernelGridY + kernelCellSz * 1.5 + 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#64748B">=</text>
                
                {/* === ELEMENT-WISE PRODUCTS (3x3) === */}
                <g id="productGrid">
                  <text x={productGridX + productCellSz * 1.5} y={productGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Products</text>
                  {elementProducts.map(({ input, weight, product }, i) => {
                    const row = Math.floor(i / 3), col = i % 3
                    const x = productGridX + col * productCellSz
                    const y = productGridY + row * productCellSz
                    const bgColor = product > 0 ? '#DCFCE7' : (product < 0 ? '#FEE2E2' : '#F8FAFC')
                    const borderColor = product > 0 ? '#22C55E' : (product < 0 ? '#EF4444' : '#E2E8F0')
                    const textColor = product > 0 ? '#166534' : (product < 0 ? '#991B1B' : '#94A3B8')
                    
                    return (
                      <g key={i}>
                        <rect 
                          x={x} y={y} 
                          width={productCellSz - 2} height={productCellSz - 2} 
                          rx={5} 
                          fill={bgColor} 
                          stroke={borderColor} 
                          strokeWidth={1.5} 
                        />
                        {/* Show the multiplication breakdown */}
                        <text 
                          x={x + (productCellSz - 2) / 2} 
                          y={y + 13} 
                          textAnchor="middle" 
                          fontSize="8" 
                          fill="#94A3B8"
                        >
                          {input}×{weight >= 0 ? (weight > 0 ? '+' : '') : ''}{weight}
                        </text>
                        {/* Show the result */}
                        <text 
                          x={x + (productCellSz - 2) / 2} 
                          y={y + (productCellSz - 2) / 2 + 8} 
                          textAnchor="middle" 
                          fontSize="14" 
                          fontWeight="700" 
                          fill={textColor}
                        >
                          {product > 0 ? `+${product}` : product}
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Sum calculation below products */}
                  <rect 
                    x={productGridX} 
                    y={productGridY + productCellSz * 3 + 8} 
                    width={productCellSz * 3 - 2} 
                    height={30} 
                    rx={6} 
                    fill={convSum > 0 ? '#DCFCE7' : (convSum < 0 ? '#FEE2E2' : '#F1F5F9')} 
                    stroke={convSum > 0 ? '#22C55E' : (convSum < 0 ? '#EF4444' : '#CBD5E1')} 
                    strokeWidth={2} 
                  />
                  <text 
                    x={productGridX + (productCellSz * 3 - 2) / 2} 
                    y={productGridY + productCellSz * 3 + 28} 
                    textAnchor="middle" 
                    fontSize="14" 
                    fontWeight="700" 
                    fill={convSum > 0 ? '#166534' : (convSum < 0 ? '#991B1B' : '#64748B')}
                  >
                    Σ = {convSum}
                  </text>
                </g>
                
                {/* === ARROW TO OUTPUT === */}
                <path 
                  d={`M ${productGridX + productCellSz * 3 + 10} ${productGridY + productCellSz * 1.5} L ${outputGridX - 15} ${productGridY + productCellSz * 1.5}`} 
                  fill="none" 
                  stroke="#94A3B8" 
                  strokeWidth={2} 
                  markerEnd="url(#arrowhead)" 
                />
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6 Z" fill="#94A3B8" />
                  </marker>
                </defs>
                
                {/* === OUTPUT MAP (3x3) - CAUSAL === */}
                <g id="outputMap">
                  <text x={outputGridX + outputCellSz * 1.5} y={outputGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Output (3×3)</text>
                  {[0, 1, 2].map(row => 
                    [0, 1, 2].map(col => {
                      const x = outputGridX + col * outputCellSz
                      const y = outputGridY + row * outputCellSz
                      const posKey = `${row},${col}`
                      const isCurrentPos = row === receptiveFieldPos.row && col === receptiveFieldPos.col
                      const storedValue = storedOutputs[posKey]
                      const hasValue = storedValue !== undefined
                      
                      // Color based on value
                      let bgColor = '#F8FAFC'
                      let borderColor = '#E2E8F0'
                      let textColor = '#CBD5E1'
                      
                      if (hasValue) {
                        if (storedValue > 0) {
                          const intensity = Math.min(1, storedValue / 6)
                          bgColor = `rgba(16, 185, 129, ${0.15 + intensity * 0.5})`
                          borderColor = '#10B981'
                          textColor = '#047857'
                        } else if (storedValue < 0) {
                          const intensity = Math.min(1, Math.abs(storedValue) / 6)
                          bgColor = `rgba(239, 68, 68, ${0.15 + intensity * 0.5})`
                          borderColor = '#EF4444'
                          textColor = '#991B1B'
                        } else {
                          bgColor = '#F1F5F9'
                          borderColor = '#94A3B8'
                          textColor = '#64748B'
                        }
                      }
                      
                      return (
                        <g 
                          key={posKey} 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => moveReceptiveField(row, col)}
                        >
                          <rect 
                            x={x} y={y} 
                            width={outputCellSz - 4} height={outputCellSz - 4} 
                            rx={6} 
                            fill={bgColor} 
                            stroke={isCurrentPos ? '#8B5CF6' : borderColor} 
                            strokeWidth={isCurrentPos ? 3 : 1.5} 
                          />
                          <text 
                            x={x + (outputCellSz - 4) / 2} 
                            y={y + (outputCellSz - 4) / 2 + 5} 
                            textAnchor="middle" 
                            fontSize="14" 
                            fontWeight="700" 
                            fill={hasValue ? textColor : '#CBD5E1'}
                          >
                            {hasValue ? storedValue : '?'}
                          </text>
                        </g>
                      )
                    })
                  )}
                  <text x={outputGridX + outputCellSz * 1.5} y={outputGridY + outputCellSz * 3 + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">click to move window</text>
                </g>
                
                {/* === SINGLE SENTENCE === */}
                <text x={svgWidth / 2} y={svgHeight - 15} textAnchor="middle" fontSize="12" fontWeight="500" fill="#64748B" fontStyle="italic">
                  The same neuron is reused at each location.
                </text>
              </>
            )
          })()}
        </svg>
        
        {/* Controls for convolution - Kernel presets */}
        {viewMode === 'scanning' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'system-ui, sans-serif' }}>Kernel:</span>
              {Object.keys(KERNEL_PRESETS).map(preset => (
                <button 
                  key={preset}
                  onClick={() => loadKernelPreset(preset)}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '13px', 
                    fontWeight: '500', 
                    color: '#64748B', 
                    backgroundColor: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontFamily: 'system-ui, sans-serif'
                  }}
                >
                  {preset.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
              <button 
                onClick={resetConvolution} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#64748B', 
                  backgroundColor: '#F1F5F9', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                Reset Map
              </button>
            </div>
          </div>
        )}
        
        {/* Presets (single/many only) */}
        {viewMode !== 'convolution' && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', alignSelf: 'center', marginRight: '4px', fontFamily: 'system-ui, sans-serif' }}>Patterns:</span>
            {Object.keys(presets).map(name => (
              <button 
                key={name} 
                onClick={() => loadPreset(name)} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: currentPreset === name ? 'white' : '#64748B', 
                  backgroundColor: currentPreset === name ? '#3B82F6' : '#F8FAFC', 
                  border: `1px solid ${currentPreset === name ? '#3B82F6' : '#E2E8F0'}`, 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  textTransform: 'capitalize',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        )}
        
        {/* Observation panel - minimal, neutral */}
        <div style={{ 
          padding: '14px 18px', 
          backgroundColor: viewMode === 'scanning' ? '#F5F3FF' : '#F8FAFC', 
          border: `1px solid ${viewMode === 'scanning' ? '#DDD6FE' : '#E2E8F0'}`, 
          borderRadius: '10px', 
          textAlign: 'center', 
          maxWidth: '580px', 
          margin: '0 auto' 
        }}>
          <p style={{ fontSize: '13px', color: viewMode === 'scanning' ? '#5B21B6' : '#475569', margin: 0, lineHeight: 1.5 }}>
            {viewMode === 'one' && (
              !singleHasInteracted 
                ? <><strong>Click a cell</strong> to activate it. Watch how weights multiply the input.</>
                : outputMode === 'yesno' 
                  ? <>Weighted sum = {singleSum}. {singleSum >= THRESHOLD ? 'Reaches threshold → YES' : 'Below threshold → NO'}</>
                  : outputMode === 'smooth'
                    ? <>Weighted sum = {singleSum}. Response increases smoothly from {SMOOTH_LOW} to {SMOOTH_HIGH}.</>
                    : <>Weighted sum = {singleSum}. Output scales with the sum (selectivity!).</>
            )}
            {viewMode === 'many' && (
              !manyHasInteracted 
                ? <>Same inputs, different weights → different selectivity.</>
                : <>Each neuron's weights determine what pattern it responds to best.</>
            )}
            {viewMode === 'scanning' && (
              convSum === 0
                ? <><strong>Output is zero.</strong> The kernel finds no matching structure here.</>
                : convSum > 0
                  ? <><strong>Positive output ({convSum}).</strong> The kernel matches the input pattern here.</>
                  : <><strong>Negative output ({convSum}).</strong> The input opposes what the kernel expects.</>
            )}
          </p>
        </div>
        
        {/* Insight text - only if showInsights is on */}
        {viewMode === 'many' && showInsights && dominantNeuron && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#5B21B6', margin: 0, fontStyle: 'italic' }}>
              {NEURON_CONFIGS[dominantNeuron].symbol} consistently responds more to {NEURON_CONFIGS[dominantNeuron].revealedName.toLowerCase()} structures.
            </p>
          </div>
        )}
        
        {/* Hint */}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
            {viewMode === 'one' && (singleHasInteracted 
              ? "Switch modes to see different decision rules for the same weighted sum."
              : "Toggle cells to build up the weighted sum."
            )}
            {viewMode === 'many' && (
              manyHasInteracted 
                ? "Click a neuron to silence it. Different weights = different selectivity."
                : "Click cells or use pattern presets below."
            )}
            {viewMode === 'scanning' && (
              Object.keys(storedOutputs).length >= 9
                ? "You've scanned all positions. Try a different kernel!"
                : "Click output cells to scan with the kernel."
            )}
          </p>
        </div>
      </main>
      )}

      </div>{/* end module2-main */}
    </div>
  )
}

export default Module2
