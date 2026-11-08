import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClusters, useClusterDetails } from '../hooks/useSpotifyApi';
import { ClusterCard, MetricCard } from '../components/Cards';
import { RadarProfileChart } from '../components/Visuals';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { Grid, Compass, User, Music, Star } from 'lucide-react';


const ClusterExplorer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Default to Cluster 0 if no parameter provided
  const selectedClusterId = id !== undefined ? Number(id) : 0;

  const { data: clusters, isLoading: clustersLoading, error: clustersError } = useClusters();
  const { data: clusterDetails, isLoading: detailsLoading, error: detailsError } = useClusterDetails(selectedClusterId);

  const handleClusterSelect = (c_id) => {
    navigate(`/explore/clusters/${c_id}`);
  };

  if (clustersLoading) {
    return <LoadingSkeleton type="grid" count={6} />;
  }

  if (clustersError) {
    return <ErrorState message="Failed to load clusters." />;
  }

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="K-Means Cluster Explorer"
        subtitle="Explore the 6 distinct clusters identified by machine learning based on song acoustics"
        icon={Grid}
      />

      {/* Cluster Cards Selection */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clusters.map((cluster) => (
          <div 
            key={cluster.cluster_id} 
            className="cursor-pointer"
            onClick={() => handleClusterSelect(cluster.cluster_id)}
          >
            <ClusterCard 
              cluster={cluster} 
              isActive={selectedClusterId === cluster.cluster_id}
              onClick={handleClusterSelect}
            />
          </div>
        ))}
      </section>

      {/* Cluster Detailed Inspection Section */}
      {selectedClusterId !== null && (
        <section className="glass-card p-6 rounded-2xl space-y-8 border border-primary/20">
          {detailsLoading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : detailsError ? (
            <ErrorState message="Failed to load cluster details." />
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                    Inspecting Cluster Profile
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    Cluster {clusterDetails.cluster_id}: {clusterDetails.cluster_name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-2xl">
                    {clusterDetails.description}
                  </p>
                </div>
                <div className="shrink-0">
                  <MetricCard 
                    title="Tracks Count" 
                    value={clusterDetails.track_count.toLocaleString()} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Radar Profile */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                    <Compass size={14} className="text-primary" />
                    <span>Average Sonic Footprint</span>
                  </h4>
                  <div className="w-full bg-[#121212]/30 rounded-xl p-3 border border-border/20">
                    <RadarProfileChart data={clusterDetails.audio_profile} name={clusterDetails.cluster_name} color="#1db954" />
                  </div>
                  
                  {/* Genre Composition Table */}
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-6 mb-3 font-mono self-start">
                    Genre Composition
                  </h4>
                  <div className="w-full space-y-2">
                    {clusterDetails.genres_contained.map((g) => (
                      <div key={g.genre} className="flex justify-between items-center text-xs py-1 border-b border-border/10">
                        <span className="font-semibold text-white capitalize">{g.genre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted font-mono">{g.count} tracks</span>
                          <span className="text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                            {Math.round(g.percentage * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Top Tracks */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Top Artists inside Cluster */}
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono flex items-center gap-1.5">
                      <User size={14} className="text-primary" />
                      <span>Dominant Artists in Cluster</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {clusterDetails.top_artists.map((art) => (
                        <div 
                          key={art.artist_name}
                          onClick={() => navigate(`/artist/${encodeURIComponent(art.artist_name)}`)}
                          className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border hover:border-primary/20 text-xs text-white font-medium cursor-pointer transition"
                        >
                          {art.artist_name} <span className="text-[10px] text-text-muted font-mono ml-1">({art.track_count})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Popular Tracks */}
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono flex items-center gap-1.5">
                      <Music size={14} className="text-primary" />
                      <span>Featured Tracks in Cluster</span>
                    </h4>
                    <div className="divide-y divide-border/20 border border-border/20 rounded-xl overflow-hidden bg-[#121212]/30 px-4">
                      {clusterDetails.top_tracks.map((track, i) => (
                        <div 
                          key={track.track_id}
                          onClick={() => navigate(`/song/${track.track_id}`)}
                          className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold text-text-muted w-5 shrink-0 text-center">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <h5 className="font-semibold text-xs text-white truncate" title={track.track_name}>
                                {track.track_name}
                              </h5>
                              <p className="text-[10px] text-text-muted truncate mt-0.5">
                                {track.track_artist}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                            <div className="flex items-center gap-0.5 text-accent-gold">
                              <Star size={10} fill="currentColor" />
                              <span>{track.track_popularity}</span>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {track.playlist_genre}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default ClusterExplorer;
