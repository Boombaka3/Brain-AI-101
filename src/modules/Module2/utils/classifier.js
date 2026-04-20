import * as ort from 'onnxruntime-web'

// Lazy singleton — session loads only on first classify call
let session = null

async function getSession() {
  if (!session) {
    // mnist-12.onnx is a LeNet-5 from the ONNX Model Zoo (~26KB)
    session = await ort.InferenceSession.create(
      import.meta.env.BASE_URL + 'model/mnist-12.onnx',
      { executionProviders: ['wasm'] }
    )
  }
  return session
}

/**
 * Classify a 28×28 grayscale ImageData as a digit 0-9.
 * Returns { label, confidence, allScores }.
 * Falls back to mock results if the model file isn't available.
 */
export async function classifyDigit(imageData) {
  try {
    const sess = await getSession()

    // Build Float32 tensor: shape [1, 1, 28, 28], pixels normalised to [0, 1]
    const float32 = new Float32Array(28 * 28)
    const { data } = imageData
    for (let i = 0; i < 28 * 28; i++) {
      // MNIST was trained on white-on-black; invert white-on-white images
      float32[i] = 1 - data[i * 4] / 255
    }

    const tensor = new ort.Tensor('float32', float32, [1, 1, 28, 28])
    const feeds = { [sess.inputNames[0]]: tensor }
    const results = await sess.run(feeds)

    const outputData = results[sess.outputNames[0]].data

    // Apply softmax
    const expVals = Array.from(outputData).map(Math.exp)
    const expSum = expVals.reduce((a, b) => a + b, 0)
    const softmax = expVals.map((v) => v / expSum)

    const label = softmax.indexOf(Math.max(...softmax))
    return {
      label: label.toString(),
      confidence: softmax[label],
      allScores: softmax,
    }
  } catch {
    // Model file not present — return honest mock so the UI still works
    return mockClassify(imageData)
  }
}

function mockClassify(imageData) {
  const { data, width, height } = imageData
  let brightness = 0
  for (let i = 0; i < data.length; i += 4) brightness += data[i]
  const avg = brightness / (width * height)
  const seed = Math.floor((avg / 255) * 9)
  const scores = Array(10).fill(0.03)
  scores[seed] = 0.6
  scores[(seed + 3) % 10] = 0.2
  const sum = scores.reduce((a, b) => a + b, 0)
  const normalised = scores.map((s) => s / sum)
  return {
    label: seed.toString(),
    confidence: normalised[seed],
    allScores: normalised,
    isMock: true,
  }
}
