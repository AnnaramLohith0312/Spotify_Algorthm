import React from 'react';
import { useAnalyticsOverview } from '../hooks/useSpotifyApi';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Music, User, Layers, HelpCircle, BarChart2 } from 'lucide-react';

const AnalyticsOverview = () => {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={4} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const COLORS = ["#1DB954", "#4A90D9", "#E74C3C", "#F39C12", "#9B59B6", "#1ABC9C"];

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Dataset Analytics Overview"
        subtitle="A high-level statistical summary of the parsed Spotify database tracks and features"
        icon={BarChart2}
      />

      {/* KPI block grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-xl border border-border/40">
          <span className="text-[9px] uppercase font-bold font-mono text-text-muted/60 tracking-wider">Tracks Checked</span>
          <div className="text-2xl font-extrabold text-white mt-1.5">{data.total_tracks.toLocaleString()}</div>
          <span className="text-[10px] text-primary font-medium mt-1.5 block">&bull; Duplicates cleaned</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border/40">
          <span className="text-[9px] uppercase font-bold font-mono text-text-muted/60 tracking-wider">Unique Artists</span>
          <div className="text-2xl font-extrabold text-white mt-1.5">{data.total_artists.toLocaleString()}</div>
          <span className="text-[10px] text-secondary font-medium mt-1.5 block">&bull; Average 2.6 songs/artist</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border/40">
          <span className="text-[9px] uppercase font-bold font-mono text-text-muted/60 tracking-wider">Unique Playlists</span>
          <div className="text-2xl font-extrabold text-white mt-1.5">{data.total_playlists}</div>
          <span className="text-[10px] text-accent-gold font-medium mt-1.5 block">&bull; Across 24 subgenres</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border/40">
          <span className="text-[9px] uppercase font-bold font-mono text-text-muted/60 tracking-wider">Average Popularity</span>
          <div className="text-2xl font-extrabold text-white mt-1.5">{Math.round(data.average_popularity)}/100</div>
          <span className="text-[10px] text-purple-400 font-medium mt-1.5 block">&bull; Min: 0, Max: 100</span>
        </div>
      </section>

      {/* Charts section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar Chart of Genre Distributions */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
            Track Count per Playlist Genre
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.genre_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis 
                  dataKey="genre" 
                  stroke="#555" 
                  tick={{ fill: '#b3b3b3', fontSize: 10 }}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <YAxis stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 9 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#2a2a2a', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}
                  itemStyle={{ color: '#1db954', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.genre_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Data info text block */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[400px]">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle size={14} className="text-primary" />
              <span>Dataset Insights</span>
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              The Spotify dataset used in this project represents an optimized collection of tracks classified across 6 main genres: <strong className="text-white">Pop, Rap, Rock, Latin, R&B, and EDM</strong>.
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Each track contains exactly 9 numeric audio characteristics measured by Spotify’s audio analysis engine, representing attributes like rhythm density, harmonic valence, acoustic resonance, vocal presence, and performance liveness.
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              K-Means clustering was executed with <strong className="text-white">k=6</strong> on the scaled audio features, grouping the songs mathematically based on acoustic properties.
            </p>
          </div>
          <div className="text-[10px] text-text-muted/50 font-mono border-t border-border/30 pt-4 flex justify-between">
            <span>Cleaned CSV Size: ~7.3 MB</span>
            <span>28,352 Rows</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsOverview;
