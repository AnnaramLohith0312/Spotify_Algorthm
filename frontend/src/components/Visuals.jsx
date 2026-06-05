import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Cell
} from 'recharts';

// 1. Radar Profile Chart (Audio Features Signature)
export const RadarProfileChart = ({ data, name = "Audio Profile", color = "#1db954" }) => {
  // Convert standard audio features dictionary to Recharts format
  // Audio features list: danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence
  const featuresList = [
    { label: "Danceability", key: "danceability" },
    { label: "Energy", key: "energy" },
    { label: "Acousticness", key: "acousticness" },
    { label: "Valence", key: "valence" },
    { label: "Speechiness", key: "speechiness" },
    { label: "Instrumentalness", key: "instrumentalness" },
    { label: "Liveness", key: "liveness" }
  ];

  const chartData = featuresList.map(feat => ({
    subject: feat.label,
    value: data ? (data[feat.key] || 0) : 0,
    fullMark: 1.0
  }));

  return (
    <div className="w-full h-80 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#2a2a2a" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#b3b3b3', fontSize: 10, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 1.0]} 
            tick={{ fill: '#b3b3b3', fontSize: 8 }}
            stroke="#2a2a2a"
          />
          <Radar
            name={name}
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Interactive Correlation Heatmap (Custom CSS grid)
export const CorrelationHeatmap = ({ correlationData }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!correlationData || !correlationData.features || !correlationData.matrix) {
    return <div className="text-center text-text-muted text-xs p-4">No correlation data available.</div>;
  }

  const { features, matrix } = correlationData;

  // Map Pearson correlation coefficient [-1, 1] to beautiful diverging color palette
  const getCellColor = (val) => {
    if (val === 1) return 'bg-primary/90 text-black'; // Self correlation
    
    // Diverging color values:
    // Positive correlation: Green
    // Negative correlation: Red
    if (val > 0) {
      const opacity = Math.round(val * 100);
      if (opacity > 75) return 'bg-[#1db954] text-black font-semibold';
      if (opacity > 50) return 'bg-[#1db954]/75 text-white';
      if (opacity > 25) return 'bg-[#1db954]/40 text-white';
      return 'bg-[#1db954]/15 text-text-muted';
    } else {
      const opacity = Math.round(Math.abs(val) * 100);
      if (opacity > 75) return 'bg-[#e74c3c] text-white font-semibold';
      if (opacity > 50) return 'bg-[#e74c3c]/75 text-white';
      if (opacity > 25) return 'bg-[#e74c3c]/40 text-white';
      return 'bg-[#e74c3c]/15 text-text-muted';
    }
  };

  const getCleanLabel = (str) => {
    return str.replace('track_', '').replace('_ms', '').replace('_min', '').replace('_', ' ').toUpperCase();
  };

  return (
    <div className="flex flex-col relative">
      {/* Scrollable container for the matrix */}
      <div className="overflow-x-auto select-none border border-border/40 rounded-xl p-4 bg-[#121212]">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="flex">
            {/* Blank corner cell */}
            <div className="w-24 shrink-0" />
            {features.map((feat) => (
              <div 
                key={`header-${feat}`} 
                className="w-14 h-10 flex items-center justify-center text-center text-[8px] font-bold text-text-muted/70 tracking-tighter truncate px-0.5"
                title={getCleanLabel(feat)}
              >
                {getCleanLabel(feat)}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {matrix.map((row) => (
            <div key={`row-${row.feature}`} className="flex">
              {/* Row title cell */}
              <div className="w-24 shrink-0 h-10 flex items-center pr-2 text-[9px] font-bold text-text-muted/80 truncate justify-end">
                {getCleanLabel(row.feature)}
              </div>

              {/* Data cells */}
              {features.map((colFeat) => {
                const val = row[colFeat];
                const isHovered = hoveredCell && hoveredCell.row === row.feature && hoveredCell.col === colFeat;

                return (
                  <div
                    key={`${row.feature}-${colFeat}`}
                    onMouseEnter={() => setHoveredCell({ row: row.feature, col: colFeat, value: val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-14 h-10 border border-[#222222] flex items-center justify-center text-[10px] font-mono cursor-crosshair transition duration-150 ${getCellColor(val)} ${
                      isHovered ? 'ring-2 ring-white scale-105 z-10' : ''
                    }`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floating cell detail drawer */}
      {hoveredCell && (
        <div className="mt-4 p-3 bg-surface-elevated border border-border rounded-lg flex items-center justify-between text-xs transition duration-200">
          <div>
            <span className="text-text-muted">Correlation: </span>
            <span className="font-bold text-white">{getCleanLabel(hoveredCell.row)}</span>
            <span className="text-text-muted"> &harr; </span>
            <span className="font-bold text-white">{getCleanLabel(hoveredCell.col)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/10">Pearson</span>
            <span className={`font-mono font-bold text-sm ${
              hoveredCell.value > 0 ? 'text-primary' : hoveredCell.value < 0 ? 'text-accent-red' : 'text-white'
            }`}>
              {hoveredCell.value > 0 ? '+' : ''}{hoveredCell.value.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. PCA Cluster Scatter Plot (2D Machine Learning Mapping)
export const PCAScatterPlot = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return <div className="text-center text-text-muted text-xs p-4">No cluster coordinates available.</div>;
  }

  // Dynamic color helper
  const getClusterColor = (c_id) => {
    const baseColors = [
      "#1db954", // C0 - Green
      "#4a90d9", // C1 - Blue
      "#e74c3c", // C2 - Red
      "#f39c12", // C3 - Gold
      "#9b59b6", // C4 - Purple
      "#1abc9c"  // C5 - Teal
    ];
    if (c_id < baseColors.length) return baseColors[c_id];
    // Golden angle distribution for dynamic HSL hues
    const hue = (c_id * 137.5) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Dynamic naming helper
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

  // Get unique cluster IDs from the data dynamically
  const uniqueClusterIds = Array.from(new Set(data.map(d => d.cluster))).sort((a, b) => a - b);

  const series = uniqueClusterIds.map((c_id) => {
    return {
      clusterId: c_id,
      name: getClusterName(c_id),
      color: getClusterColor(c_id),
      points: data.filter(d => d.cluster === c_id).map(d => ({
        x: d.pc1,
        y: d.pc2,
        track_id: d.track_id,
        track_name: d.track_name,
        track_artist: d.track_artist,
        genre: d.playlist_genre
      }))
    };
  });

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="bg-surface-elevated border border-border p-3 rounded-lg shadow-xl text-xs max-w-[200px]">
          <div className="font-bold text-white truncate">{info.track_name}</div>
          <div className="text-text-muted truncate mt-0.5">{info.track_artist}</div>
          <div className="text-[10px] uppercase font-bold text-primary mt-2">{info.genre}</div>
          <div className="text-[10px] text-text-muted/60 mt-1 font-mono">PC1: {info.x.toFixed(2)}, PC2: {info.y.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };

  const handlePointClick = (point) => {
    if (point && point.track_id) {
      navigate(`/song/${point.track_id}`);
    }
  };

  return (
    <div className="w-full h-[450px] bg-black/30 border border-border/30 rounded-xl p-4 flex flex-col gap-4 select-none">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name="PC1" 
              stroke="#404040" 
              tick={{ fill: '#b3b3b3', fontSize: 10 }}
              label={{ value: 'Principal Component 1', position: 'bottom', fill: '#b3b3b3', fontSize: 11, offset: 0 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="PC2" 
              stroke="#404040" 
              tick={{ fill: '#b3b3b3', fontSize: 10 }}
              label={{ value: 'Principal Component 2', angle: -90, position: 'left', fill: '#b3b3b3', fontSize: 11, offset: 10 }}
            />
            <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {series.map((s) => (
              <Scatter
                key={`scatter-c${s.clusterId}`}
                name={s.name}
                data={s.points}
                fill={s.color}
                onClick={handlePointClick}
                cursor="pointer"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Custom color-coordinated legend rows */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-border/30 pt-3 text-[10px]">
        {series.map((s) => (
          <div key={`legend-${s.clusterId}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-white truncate font-medium">{s.name}</span>
            <span className="text-text-muted font-mono ml-auto">{s.points.length} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartWrapper = ({ title, description, children, heightClass = 'h-80' }) => {
  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">{title}</h3>}
          {description && <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">{description}</p>}
        </div>
      )}
      <div className={`flex-grow w-full ${heightClass}`}>
        {children}
      </div>
    </div>
  );
};

export const RadarChartShell = RadarProfileChart;
export const HeatmapShell = CorrelationHeatmap;
export const ScatterPlotShell = PCAScatterPlot;

