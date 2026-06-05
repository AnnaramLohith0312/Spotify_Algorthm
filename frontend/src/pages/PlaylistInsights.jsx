import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlaylists, usePlaylistDetails } from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork, MetricCard } from '../components/Cards';
import { LoadingSkeleton, ErrorState, EmptyState, PageHeader } from '../components/Feedback';
import { Layers, Star, Play, Music, Compass } from 'lucide-react';

const PlaylistInsights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const { data: playlists, isLoading: playlistsLoading, error: playlistsError } = usePlaylists();
  const { data: details, isLoading: detailsLoading, error: detailsError } = usePlaylistDetails(selectedPlaylist);

  // Sync with URL query parameter ?name=xyz if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get('name');
    if (name) {
      setSelectedPlaylist(name);
    } else if (playlists && playlists.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(playlists[0].playlist_name);
    }
  }, [location, playlists, selectedPlaylist]);

  if (playlistsLoading) {
    return <LoadingSkeleton type="grid" count={6} />;
  }

  if (playlistsError) {
    return <ErrorState message="Failed to load playlists." />;
  }

  const handlePlaylistSelect = (name) => {
    setSelectedPlaylist(name);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Playlist Insights Dashboard"
        subtitle="Explore and compare the characteristics of playlists within the Spotify database"
        icon={Layers}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Playlists List Panel */}
        <div className="lg:col-span-1 glass-card rounded-2xl flex flex-col max-h-[600px] overflow-hidden border border-border/40">
          <div className="p-4 border-b border-border bg-black/40">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Dataset Playlists ({playlists.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {playlists.map((p) => {
              const isSelected = selectedPlaylist === p.playlist_name;
              return (
                <div
                  key={p.playlist_name}
                  onClick={() => handlePlaylistSelect(p.playlist_name)}
                  className={`p-3.5 flex flex-col gap-1 cursor-pointer transition duration-150 ${
                    isSelected 
                      ? 'bg-primary/5 border-l-4 border-primary text-white font-semibold' 
                      : 'text-text-muted hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <span className="text-xs truncate font-medium" title={p.playlist_name}>
                    {p.playlist_name}
                  </span>
                  <div className="flex justify-between text-[9px] font-mono text-text-muted/60 mt-0.5">
                    <span className="capitalize">{p.playlist_genre}</span>
                    <span>{p.track_count} tracks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Playlist Detailed Analytics */}
        <div className="lg:col-span-3 space-y-8">
          {selectedPlaylist ? (
            detailsLoading ? (
              <LoadingSkeleton type="list" count={5} />
            ) : detailsError ? (
              <ErrorState message="Failed to load playlist details." />
            ) : (
              <div className="space-y-8">
                {/* Header Summary Card */}
                <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden border border-primary/10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <AlbumArtwork title={details.playlist_name} sizeClass="w-28 h-28 md:w-32 md:h-32" roundedClass="rounded-xl shadow-xl" />
                  
                  <div className="flex-1 min-w-0 space-y-3.5 text-center md:text-left">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {details.playlist_genre} &bull; {details.playlist_subgenre}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-white mt-2.5 truncate" title={details.playlist_name}>
                        {details.playlist_name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">
                        Contains {details.track_count} songs in our active recommendation pool
                      </p>
                    </div>

                    <div className="shrink-0">
                      <MetricCard 
                        title="Avg Popularity" 
                        value={`${Math.round(details.avg_popularity)}/100`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Visualizations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono w-full text-center">
                      Average Audio Profile Signature
                    </h4>
                    <div className="w-full">
                      <RadarProfileChart data={details.audio_profile} name={details.playlist_name} color="#1db954" />
                    </div>
                  </div>

                  {/* Tracks List */}
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2 font-mono flex items-center gap-1.5">
                      <Music size={14} className="text-primary" />
                      <span>Playlist Track Preview</span>
                    </h4>
                    <div className="divide-y divide-border/20 max-h-[300px] overflow-y-auto pr-2">
                      {details.tracks.map((track, i) => (
                        <div
                          key={track.track_id}
                          onClick={() => navigate(`/song/${track.track_id}`)}
                          className="py-2.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 px-2 rounded-lg transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-text-muted w-5 shrink-0 text-center">
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

                          <div className="flex items-center gap-2 text-xs shrink-0 font-mono">
                            <div className="flex items-center gap-0.5 text-accent-gold">
                              <Star size={10} fill="currentColor" />
                              <span>{track.track_popularity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <EmptyState 
              title="Select a playlist" 
              message="Choose a playlist from the left panel to inspect its audio characteristics and distribution."
              iconType="compass"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistInsights;
