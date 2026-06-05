import React from 'react';
import { 
  usePCAScatterData, 
  useClusterCentroids, 
  useGenreClusterComposition 
} from '../hooks/useSpotifyApi';
import { PCAScatterPlot } from '../components/Visuals';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, LayoutGrid, BarChart2 } from 'lucide-react';

const ClusterAnalytics = () => {
  const { data: pcaData, isLoading: pcaLoading, error: pcaError } = usePCAScatterData(1500);
  const { data: centroids, isLoading: centroidsLoading, error: centroidsError } = useClusterCentroids();
  const { data: composition, isLoading: compositionLoading, error: compositionError } = useGenreClusterComposition();

  if (pcaLoading || centroidsLoading || compositionLoading) {
    return <LoadingSkeleton type="grid" count={2} />;
  }

  if (pcaError || centroidsError || compositionError) {
    return <ErrorState message="Failed to load cluster analytics." />;
  }

  const getClusterColor = (c_id) => {
    const baseColors = ["#1db954", "#4a90d9", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c"];
    if (c_id < baseColors.length) return baseColors[c_id];
    const hue = (c_id * 137.5) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getClusterName = (c_id) => {
    const baseNames = [
      "Acoustic & Mellow",
      "Danceable Pop / Latin",
      "High-Energy Electronic",
      "Upbeat R&B / Funk",
      "Intense EDM",
      "Dark Energetic"
    ];
    if (c_id < baseNames.length) return baseNames[c_id];
    return `Cluster ${c_id}`;
  };

  const getCompositionClusterIds = () => {
    if (!composition || composition.length === 0) return [];
    const keys = Object.keys(composition[0]);
    return keys
      .filter(k => k.startsWith('cluster_'))
      .map(k => Number(k.replace('cluster_', '')))
      .sort((a, b) => a - b);
  };
  
  const GENRE_COLORS = {
    "pop": "#1DB954",
    "rap": "#4A90D9",
    "rock": "#E74C3C",
    "latin": "#F39C12",
    "r&b": "#9B59B6",
    "edm": "#1ABC9C"
  };

  // Centroid cell heat mapping
  const getCentroidCellColor = (val) => {
    // val is typical feature value between 0.0 and 1.0
    const opacity = Math.round(val * 100);
    if (opacity > 80) return 'bg-primary/95 text-black font-semibold';
    if (opacity > 60) return 'bg-primary/70 text-white';
    if (opacity > 40) return 'bg-primary/45 text-white';
    if (opacity > 20) return 'bg-primary/20 text-text-muted';
    return 'bg-primary/5 text-text-muted/60';
  };

  return (
    <div className="space-y-10 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="K-Means Model & Cluster Analytics"
        subtitle="Visualizations of the trained clustering model including 2D principal component projections"
        icon={Activity}
      />

      {/* PCA Scatter plot */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="font-bold text-base text-white">2D Principal Component Projection (PCA)</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            The 9-dimensional audio feature vectors were reduced to 2 principal components using PCA for 2D mapping. Each dot represents a track, color-coded by its mathematical KMeans cluster. Click a point to inspect the song.
          </p>
        </div>
        <PCAScatterPlot data={pcaData} />
      </section>

      {/* Composition & Centroid Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Stacked Cluster Composition per Genre */}
        <div className="glass-card p-6 rounded-2xl flex flex-col h-[480px]">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              Cluster Composition per Genre
            </h3>
            <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
              Shows how each parent genre is divided across the 6 mathematical clusters.
            </p>
          </div>
          <div className="flex-1 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={composition} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis 
                  dataKey="playlist_genre" 
                  stroke="#555" 
                  tick={{ fill: '#b3b3b3', fontSize: 10 }}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <YAxis stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 9 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#2a2a2a', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fill: '#fff', paddingTop: '15px' }}
                  iconSize={10}
                />
                {getCompositionClusterIds().map((c_id) => (
                  <Bar 
                    key={c_id}
                    dataKey={`cluster_${c_id}`} 
                    stackId="a" 
                    name={getClusterName(c_id)}
                    fill={getClusterColor(c_id)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Cluster Centroids Heatmap grid */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[480px] overflow-hidden">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              Cluster Centroids Feature Matrix
            </h3>
            <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
              Average audio feature values for each cluster. High values are highlighted.
            </p>
          </div>

          <div className="flex-1 overflow-x-auto mt-6">
            <div className="min-w-[450px]">
              {/* Header row */}
              <div className="flex text-[9px] font-bold text-text-muted/60 uppercase tracking-tight">
                <div className="w-20 shrink-0" />
                <div className="w-12 text-center">Dance</div>
                <div className="w-12 text-center">Energy</div>
                <div className="w-12 text-center font-mono">Speech</div>
                <div className="w-12 text-center">Acous</div>
                <div className="w-12 text-center">Instr</div>
                <div className="w-12 text-center">Live</div>
                <div className="w-12 text-center">Valence</div>
              </div>

              {/* Rows */}
              {centroids.map((c) => (
                <div key={c.cluster} className="flex items-center mt-2.5">
                  <div className="w-20 shrink-0 text-[10px] font-bold text-white truncate" title={getClusterName(c.cluster)}>
                    {getClusterName(c.cluster)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.danceability)}`}>
                    {c.danceability.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.energy)}`}>
                    {c.energy.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.speechiness)}`}>
                    {c.speechiness.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.acousticness)}`}>
                    {c.acousticness.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.instrumentalness)}`}>
                    {c.instrumentalness.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.liveness)}`}>
                    {c.liveness.toFixed(2)}
                  </div>
                  <div className={`w-12 h-8 border border-black flex items-center justify-center text-[10px] font-mono ${getCentroidCellColor(c.valence)}`}>
                    {c.valence.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-text-muted/40 border-t border-border/30 pt-4 text-right">
            Values scaled between [0.0 - 1.0]
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClusterAnalytics;
