import KMeansControls from './KMeansControls'
import KMeansPlot from './KMeansPlot'
import useKMeansDemo from './useKMeansDemo'

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
          <div className="m3-kmeans-stage-header">
            <div className="m3-kmeans-stage-copy">
              <p className="m3-type-desc">
                Place points in the feature space and watch k-means repeatedly assign each point to the nearest centroid, then move the centroid to the mean.
              </p>
            </div>
            <div className="m3-rl-legend">
              <span className="m3-rl-legend-chip m3-kmeans-chip">No labels</span>
              <span className="m3-rl-legend-chip m3-kmeans-chip">Nearest centroid</span>
              <span className="m3-rl-legend-chip m3-kmeans-chip">Mean update</span>
            </div>
          </div>

          <KMeansPlot points={points} centroids={centroids} onAddPoint={addPoint} />
        </div>

        <div className="m3-kmeans-sidebar">
          <div className="m3-kmeans-summary">
            <div className="m3-kmeans-summary-copy">
              <span className="m3-kmeans-summary-label">Signal</span>
              <p>{statusCopy}</p>
            </div>

            <dl className="m3-kmeans-stat-strip">
              <div className="m3-kmeans-stat-item">
                <dt>Points</dt>
                <dd>{points.length}</dd>
              </div>
              <div className="m3-kmeans-stat-item">
                <dt>Clusters</dt>
                <dd>{clusterCount}</dd>
              </div>
              <div className="m3-kmeans-stat-item">
                <dt>Iterations</dt>
                <dd>{iteration}</dd>
              </div>
              <div className="m3-kmeans-stat-item">
                <dt>Shift</dt>
                <dd>{lastShift.toFixed(3)}</dd>
              </div>
            </dl>
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
      </div>
    </div>
  )
}

export default ClusteringLab
