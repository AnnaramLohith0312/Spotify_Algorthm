import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtistRecommendations } from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork } from '../components/Cards';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { Sparkles, Star, Heart, Play, BarChart2 } from 'lucide-react';

const ArtistRecommendations = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [topN, setTopN] = useState(10);

  const { data: recData, isLoading, error } = useArtistRecommendations(name, topN);

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={5} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => navigate('/search')} />;
  }

  const { artist_name, dominant_cluster, dominant_cluster_name, artist_fingerprint, recommendations } = recData;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Artist-Based Music Discovery"
        subtitle="Recommendations aligned to the average audio profile signature of the selected artist"
        icon={() => <Sparkles className="text-secondary" size={24} />}
      />

      {/* Artist Profile Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Artist Meta */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="aspect-square w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0 shadow-2xl">
            <AlbumArtwork title={artist_name} sizeClass="w-full h-full" roundedClass="rounded-full" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Artist DNA Profile
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-3 truncate">
                {artist_name}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                Dominant Sonic Style: <span className="text-white font-bold">{dominant_cluster_name}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start pt-2">
              <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                Cluster C{dominant_cluster}
              </span>
              <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                Targeting Similar Tempos
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              We analyzed all songs by <span className="text-white font-medium">{artist_name}</span> in our dataset to compute their average feature fingerprint. Recommendations are tracks from cluster <span className="text-white font-medium">C{dominant_cluster}</span> by other artists, ranked by similarity to this average fingerprint.
            </p>
          </div>
        </div>

        {/* Right: Artist DNA Radar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center items-center">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">
            Artist Fingerprint
          </h4>
          <RadarProfileChart data={artist_fingerprint} name={artist_name} color="#4a90d9" />
        </div>
      </section>

      {/* Recommendations Results List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart2 size={18} className="text-secondary" />
            <span>Recommended Tracks for {artist_name} fans</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">List Limit:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-surface-elevated border border-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-secondary font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="space-y-3.5 select-none">
          {recommendations.length === 0 ? (
            <div className="text-center text-text-muted text-xs p-8 glass-card rounded-xl">
              No recommendations could be generated for this artist.
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div 
                key={rec.track_id}
                onClick={() => navigate(`/song/${rec.track_id}`)}
                className="glass-card p-4 rounded-xl border border-border/30 hover:border-secondary/20 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0 w-full md:w-2/5">
                  <span className="text-sm font-mono font-bold text-text-muted w-5 text-center shrink-0">
                    {index + 1}
                  </span>
                  <AlbumArtwork title={rec.track_name} sizeClass="w-10 h-10" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate" title={rec.track_name}>
                      {rec.track_name}
                    </h4>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {rec.track_artist}
                    </p>
                  </div>
                </div>

                {/* Similarity Metrics Columns */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-3/5 text-xs font-mono">
                  <div className="text-center">
                    <span className="text-[9px] text-text-muted/50 block uppercase">Fingerprint Sim</span>
                    <span className="text-white font-bold">{(rec.similarity * 100).toFixed(1)}%</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] text-text-muted/50 block uppercase">Popularity</span>
                    <span className="text-accent-gold font-bold">{rec.track_popularity}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] text-text-muted/50 block uppercase">Weighted Score</span>
                    <span className="text-secondary font-bold">{(rec.final_score * 100).toFixed(1)}%</span>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recommend/song/${rec.track_id}`);
                      }}
                      className="w-8 h-8 rounded-full bg-secondary/10 hover:bg-secondary text-secondary hover:text-black flex items-center justify-center transition duration-200"
                      title="Generate similar recommendations"
                    >
                      <Play size={12} fill="currentColor" className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ArtistRecommendations;
