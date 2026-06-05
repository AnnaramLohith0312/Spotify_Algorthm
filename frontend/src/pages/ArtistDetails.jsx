import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtistDetails } from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork } from '../components/Cards';
import { LoadingSkeleton, ErrorState } from '../components/Feedback';
import { User, Play, Star, Calendar, Music, Sparkles } from 'lucide-react';

const ArtistDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const { data: artist, isLoading, error } = useArtistDetails(name);

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={1} />;
  }

  if (error || !artist) {
    return <ErrorState message={error?.message || "Artist not found."} onRetry={() => navigate('/search')} />;
  }

  return (
    <div className="space-y-8 select-none">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="text-xs text-text-muted hover:text-white transition duration-200"
      >
        &larr; Back to previous view
      </button>

      {/* Main Artist Summary Panel */}
      <section className="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="aspect-square w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0 shadow-2xl">
          <AlbumArtwork title={artist.artist_name} sizeClass="w-full h-full" roundedClass="rounded-full" />
        </div>

        <div className="flex-1 space-y-5 text-center md:text-left min-w-0">
          <div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                {artist.dominant_genre}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Cluster {artist.dominant_cluster}: {artist.dominant_cluster_name}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-3 truncate">
              {artist.artist_name}
            </h2>
            <p className="text-sm text-text-muted mt-1 font-mono">
              Dataset Profile Analysis &bull; {artist.track_count} unique tracks registered
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start pt-2">
            <button
              onClick={() => navigate(`/recommend/artist/${encodeURIComponent(artist.artist_name)}`)}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-black rounded-full font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition duration-200 shadow-lg"
            >
              <Sparkles size={14} />
              <span>Recommend Similar Songs</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visual Analytics & Top Tracks Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Tracks Table */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5 flex items-center gap-2">
            <Music size={14} className="text-secondary" />
            <span>Top Dataset Tracks</span>
          </h3>
          
          <div className="divide-y divide-border/20">
            {artist.top_tracks.map((track, i) => (
              <div 
                key={track.track_id}
                onClick={() => navigate(`/song/${track.track_id}`)}
                className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-text-muted w-5 shrink-0 text-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-white truncate" title={track.track_name}>
                      {track.track_name}
                    </h4>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">
                      Album: {track.track_album_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0 font-mono">
                  <div className="flex items-center gap-0.5 text-accent-gold" title="Popularity">
                    <Star size={10} fill="currentColor" />
                    <span>{track.track_popularity}</span>
                  </div>
                  <span className="text-[9px] text-text-muted/80 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    C{track.cluster}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Radar Chart of Average Profile */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5 w-full text-center">
            Average Audio DNA
          </h3>
          <div className="mt-4 w-full">
            <RadarProfileChart data={artist.audio_profile} name={artist.artist_name} color="#4a90d9" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtistDetails;
