// Apply 3x3 convolution to grayscale ImageData, zero-padded for same-size output
export function applyConvolution(imageData, width, height, kernel, normalize = false) {
  const src = imageData.data
  const output = new Uint8ClampedArray(src.length)
  let kernelSum = kernel.reduce((a, b) => a + b, 0)
  if (kernelSum === 0) kernelSum = 1
  const shouldNormalize = normalize && kernelSum > 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx
          const py = y + ky
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const srcIdx = (py * width + px) * 4
            const gray = src[srcIdx]
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            sum += gray * kernel[kernelIdx]
          }
        }
      }
      if (shouldNormalize) sum = sum / kernelSum
      const value = Math.max(0, Math.min(255, Math.round(sum)))
      const outIdx = (y * width + x) * 4
      output[outIdx] = value
      output[outIdx + 1] = value
      output[outIdx + 2] = value
      output[outIdx + 3] = 255
    }
  }
  return new ImageData(output, width, height)
}

// Convert RGBA ImageData to grayscale in-place
export function toGrayscale(imageData) {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  return imageData
}

// Resize any image/canvas source to a 28×28 grayscale ImageData for inference
export function preprocessForClassification(source) {
  const canvas = document.createElement('canvas')
  canvas.width = 28
  canvas.height = 28
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 28, 28)
  const srcWidth = source.width || source.naturalWidth
  const srcHeight = source.height || source.naturalHeight
  const scale = Math.min(26 / srcWidth, 26 / srcHeight)
  const scaledWidth = srcWidth * scale
  const scaledHeight = srcHeight * scale
  const offsetX = (28 - scaledWidth) / 2
  const offsetY = (28 - scaledHeight) / 2
  ctx.drawImage(source, offsetX, offsetY, scaledWidth, scaledHeight)
  return toGrayscale(ctx.getImageData(0, 0, 28, 28))
}
