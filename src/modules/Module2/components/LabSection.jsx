import { useState, useRef } from 'react'
import { LAB_KERNEL_PRESETS, LAB_BIO_BRIDGE, LAB_MAX_IMAGE_SIZE } from '../module2Config'
import { applyConvolution, toGrayscale } from '../utils/imageProcessing'

function LabSection() {
  const [labImage, setLabImage] = useState(null)
  const [labImageData, setLabImageData] = useState(null)
  const [labProcessedUrl, setLabProcessedUrl] = useState(null)
  const [labKernelPreset, setLabKernelPreset] = useState('identity')
  const [labKernel, setLabKernel] = useState([...LAB_KERNEL_PRESETS.identity.kernel])
  const [labNormalize, setLabNormalize] = useState(true)
  const [labProcessing, setLabProcessing] = useState(false)
  const [labImageSize, setLabImageSize] = useState({ width: 0, height: 0 })
  const labFileInputRef = useRef(null)

  const labBioText = labKernelPreset === 'custom'
    ? 'Custom kernel — experiment to see what features emerge.'
    : LAB_KERNEL_PRESETS[labKernelPreset]?.description || LAB_BIO_BRIDGE.none

  const processLabImage = (imageData, kernelToUse, normalize) => {
    if (!imageData) return
    setLabProcessing(true)
    requestAnimationFrame(() => {
      const processed = applyConvolution(imageData, imageData.width, imageData.height, kernelToUse, normalize)
      const canvas = document.createElement('canvas')
      canvas.width = imageData.width
      canvas.height = imageData.height
      const ctx = canvas.getContext('2d')
      ctx.putImageData(processed, 0, 0)
      setLabProcessedUrl(canvas.toDataURL())
      setLabProcessing(false)
    })
  }

  const handleLabImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width, height = img.height
        if (width > LAB_MAX_IMAGE_SIZE || height > LAB_MAX_IMAGE_SIZE) {
          const scale = LAB_MAX_IMAGE_SIZE / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        setLabImageSize({ width, height })
        setLabImage(event.target.result)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const imageData = ctx.getImageData(0, 0, width, height)
        toGrayscale(imageData)
        setLabImageData(imageData)
        processLabImage(imageData, labKernel, labNormalize)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleLabKernelPreset = (presetKey) => {
    const preset = LAB_KERNEL_PRESETS[presetKey]
    if (!preset) return
    setLabKernelPreset(presetKey)
    setLabKernel([...preset.kernel])
    if (labImageData) processLabImage(labImageData, preset.kernel, labNormalize)
  }

  const handleLabKernelEdit = (index, delta) => {
    const k = [...labKernel]
    k[index] = Math.max(-9, Math.min(9, k[index] + delta))
    setLabKernel(k)
    setLabKernelPreset('custom')
    if (labImageData) processLabImage(labImageData, k, labNormalize)
  }

  const handleLabNormalizeToggle = () => {
    const n = !labNormalize
    setLabNormalize(n)
    if (labImageData) processLabImage(labImageData, labKernel, n)
  }

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">E. Virtual Lab</p>
        <h2>Kernels on Real Images</h2>
        <p className="m2-section-subtitle">Apply what you learned: upload an image and see kernels in action.</p>
      </div>

      <div className="m2-section-card">
        <div className="m2-lab-grid">
          {/* Original Image */}
          <div className="m2-lab-panel">
            <h3 className="m2-lab-panel-title">Original Image</h3>
            {!labImage ? (
              <div className="m2-lab-upload" onClick={() => labFileInputRef.current?.click()}>
                <p className="m2-lab-upload-icon">📷</p>
                <p className="m2-lab-upload-text">Click to upload an image</p>
                <p className="m2-lab-upload-hint">JPG, PNG, or GIF</p>
              </div>
            ) : (
              <div className="m2-lab-preview">
                <img src={labImage} alt="Original" className="m2-lab-img" />
                <button className="m2-lab-change-btn" onClick={() => labFileInputRef.current?.click()}>Change image</button>
              </div>
            )}
            <input ref={labFileInputRef} type="file" accept="image/*" onChange={handleLabImageUpload} style={{ display: 'none' }} />
          </div>

          {/* Kernel Controls */}
          <div className="m2-lab-panel m2-lab-panel--kernel">
            <h3 className="m2-lab-panel-title">Kernel (3×3)</h3>
            <select className="m2-lab-select" value={labKernelPreset} onChange={(e) => handleLabKernelPreset(e.target.value)}>
              {Object.entries(LAB_KERNEL_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
              {labKernelPreset === 'custom' && <option value="custom">Custom</option>}
            </select>

            <div className="m2-lab-kernel-grid">
              {labKernel.map((value, idx) => (
                <div key={idx} className={`m2-lab-kernel-cell${value > 0 ? ' m2-lab-kernel-cell--pos' : value < 0 ? ' m2-lab-kernel-cell--neg' : ''}`}>
                  <div className="m2-lab-kernel-value">{value}</div>
                  <div className="m2-lab-kernel-btns">
                    <button onClick={() => handleLabKernelEdit(idx, -1)}>−</button>
                    <button onClick={() => handleLabKernelEdit(idx, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="m2-lab-normalize">
              <span>Normalize (for blur)</span>
              <button className={`m2-lab-toggle${labNormalize ? ' m2-lab-toggle--on' : ''}`} onClick={handleLabNormalizeToggle}>
                <div className="m2-lab-toggle-thumb" />
              </button>
            </div>

            <p className="m2-hint" style={{ marginTop: 8 }}>Kernel sum: {labKernel.reduce((a, b) => a + b, 0)}</p>
          </div>

          {/* Processed Output */}
          <div className="m2-lab-panel">
            <h3 className="m2-lab-panel-title">Processed Output</h3>
            {!labImage ? (
              <div className="m2-lab-placeholder">
                <p className="m2-lab-upload-icon" style={{ opacity: 0.5 }}>🖼️</p>
                <p className="m2-lab-upload-hint">Upload an image to see output</p>
              </div>
            ) : labProcessing ? (
              <div className="m2-lab-placeholder">
                <p className="m2-lab-upload-hint">Processing...</p>
              </div>
            ) : labProcessedUrl ? (
              <div className="m2-lab-preview">
                <img src={labProcessedUrl} alt="Processed" className="m2-lab-img" />
                <p className="m2-hint" style={{ marginTop: 8 }}>{labImageSize.width} × {labImageSize.height} px (grayscale)</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bio-bridge */}
        <div className="m2-bio-bridge">
          <p className="m2-bio-bridge-text">🧠 {labBioText}</p>
          <p className="m2-bio-bridge-sub">The kernel (weights) slides across every location — this is scanning/convolution.</p>
        </div>
      </div>
    </section>
  )
}

export default LabSection
