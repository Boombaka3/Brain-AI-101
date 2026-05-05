import KMeansControls from './KMeansControls'
import KMeansPlot from './KMeansPlot'
import useKMeansDemo from '../clustering/useKMeansDemo'

function ClusteringLab() {
  const {
    clusterCount,
    clusterSizes,
    converged,
    centroids,
    isRunning,
    iteration,
    lastShift,
    maxPoints,
    points,
    speed,
    statusCopy,
    addPoint,
    addSamplePoints,
    clearPoints,
    handleClusterCountChange,
    resetCentroids,
    setIsRunning,
    setSpeed,
    step,
  } = useKMeansDemo()

  return (
    <div className="m3-kmeans-shell">
      <div className="m3-kmeans-layout">
        <div className="m3-kmeans-stage">
          <div className="m3-rl-stage-header">
            <div>
              <p className="m3-rl-control-label">Unsupervised Learning: Find Groups</p>
            </div>
            <div className="m3-rl-legend">
              <span className="m3-rl-legend-chip m3-kmeans-chip">No labels</span>
              <span className="m3-rl-legend-chip m3-kmeans-chip">Nearest centroid</span>
              <span className="m3-rl-legend-chip m3-kmeans-chip">Mean update</span>
            </div>
          </div>

          <KMeansPlot points={points} centroids={centroids} onAddPoint={addPoint} />

          <div className="m3-rl-status-row">
            <div className="m3-rl-stat-card">
              <span>Points</span>
              <strong>{points.length}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Clusters</span>
              <strong>{clusterCount}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Iterations</span>
              <strong>{iteration}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Centroid shift</span>
              <strong>{lastShift.toFixed(3)}</strong>
            </div>
          </div>

          <div className="m3-rl-insight">
            <strong>Signal:</strong> {statusCopy}
          </div>
        </div>

        <KMeansControls
          clusterCount={clusterCount}
          clusterSizes={clusterSizes}
          converged={converged}
          isRunning={isRunning}
          maxPoints={maxPoints}
          pointCount={points.length}
          speed={speed}
          onAddSamplePoints={addSamplePoints}
          onClearPoints={clearPoints}
          onClusterCountChange={handleClusterCountChange}
          onResetCentroids={resetCentroids}
          onSetIsRunning={setIsRunning}
          onSetSpeed={setSpeed}
          onStep={step}
        />
      </div>

      <div className="m3-kmeans-bottom-grid">
        <div className="m3-rl-q-card">
          <p className="m3-rl-control-label">How to Read It</p>
          <div className="m3-rl-copy-list">
            <p><strong>Gray points:</strong> not assigned</p>
            <p><strong>Colored points:</strong> assigned to a group</p>
            <p><strong>Center point:</strong> moves toward the group average</p>
          </div>
        </div>

        <div className="m3-rl-q-card">
          <p className="m3-rl-control-label">Learning Signal</p>
          <div className="m3-rl-copy-list">
            <p><strong>No target answer</strong></p>
            <p><strong>No reward</strong></p>
            <p><strong>Distance guides the grouping</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClusteringLab
