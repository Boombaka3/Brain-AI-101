import { CLUSTER_COLORS } from './KMeansPlot'

function KMeansControls({
  clusterCount,
  clusterSizes,
  converged,
  isRunning,
  maxPoints,
  pointCount,
  speed,
  onAddSamplePoints,
  onClearPoints,
  onClusterCountChange,
  onResetCentroids,
  onSetIsRunning,
  onSetSpeed,
  onStep,
}) {
  return (
    <div className="m3-kmeans-controls">
      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Controls</p>

        <label className="m3-rl-slider">
          <div className="m3-rl-slider-head">
            <span>Clusters</span>
            <strong>{clusterCount}</strong>
          </div>
          <input type="range" min="2" max="5" step="1" value={clusterCount} onChange={(event) => onClusterCountChange(Number(event.target.value))} />
        </label>

        <label className="m3-rl-slider">
          <div className="m3-rl-slider-head">
            <span>Animation speed</span>
            <strong>{(speed / 1000).toFixed(1)}s</strong>
          </div>
          <input type="range" min="250" max="1200" step="50" value={speed} onChange={(event) => onSetSpeed(Number(event.target.value))} />
        </label>

        <div className="m3-controls m3-controls--rl">
          <button className="m3-btn m3-btn--primary" onClick={onAddSamplePoints}>Load Sample</button>
          <button className="m3-btn" onClick={() => onSetIsRunning((value) => !value)} disabled={pointCount === 0}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="m3-btn" onClick={onStep} disabled={pointCount === 0 || converged}>Step Once</button>
          <button className="m3-btn" onClick={onResetCentroids} disabled={pointCount === 0}>Reset Centroids</button>
          <button className="m3-btn" onClick={onClearPoints} disabled={pointCount === 0}>Clear Plot</button>
        </div>
      </div>

      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Cluster snapshot</p>
        <div className="m3-kmeans-cluster-list">
          {clusterSizes.map((size, index) => (
            <div key={`cluster-${index}`} className="m3-kmeans-cluster-item">
              <span className="m3-kmeans-cluster-swatch" style={{ backgroundColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }} />
              <span>Cluster {index + 1}</span>
              <strong>{size} pts</strong>
            </div>
          ))}
        </div>
        <p className="m3-type-desc">Up to {maxPoints} points. Changing the cluster count resets the centroids so you can compare a fresh grouping.</p>
      </div>
    </div>
  )
}

export default KMeansControls
