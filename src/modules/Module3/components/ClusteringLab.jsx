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
              <p className="m3-rl-control-label">Part 1. Unsupervised learning</p>
              <h3>Let the data sort itself into groups</h3>
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
            <strong>What k-means is doing:</strong> {statusCopy}
          </div>

          <div className="m3-rl-insight m3-rl-insight--soft">
            <strong>Human parallel:</strong> this is like noticing which people naturally sit together before anyone tells you who is friends with whom.
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
          <p className="m3-rl-control-label">Read the picture</p>
          <div className="m3-rl-copy-list">
            <p><strong>Gray points</strong> mean the algorithm has not assigned clusters yet.</p>
            <p><strong>Colored points</strong> belong to the centroid with the shortest distance.</p>
            <p><strong>Crosshair markers</strong> are centroids. They slide toward the average location of their assigned points each round.</p>
          </div>
        </div>

        <div className="m3-rl-q-card">
          <p className="m3-rl-control-label">Why this comes before RL</p>
          <div className="m3-rl-copy-list">
            <p><strong>Unsupervised learning</strong> finds structure without reward labels or right answers.</p>
            <p><strong>Supervised learning</strong> adds an answer key and checks each guess against it.</p>
            <p><strong>Reinforcement learning</strong> comes after that and replaces the answer key with consequences over time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClusteringLab
