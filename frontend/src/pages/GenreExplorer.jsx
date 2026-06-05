import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGenres, useGenreDetails } from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { GenreCard, MetricCard } from '../components/Cards';
import { Compass, Star, Music } from 'lucide-react';

const GenreExplorer = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  
  // Default to pop if no parameter provided
  const selectedGenre = name || 'pop';

  const { data: genres, isLoading: genresLoading, error: genresError } = useGenres();
  const { data: genreDetails, isLoading: detailsLoading, error: detailsError } = useGenreDetails(selectedGenre);

  if (genresLoading) {
    return <LoadingSkeleton type="grid" count={6} />;
  }

  if (genresError) {
    return <ErrorState message="Failed to load genres." />;
  }

  const handleGenreSelect = (genreName) => {
    navigate(`/explore/genres/${genreName}`);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Genre Explorer & Mapping"
        subtitle="Compare the 6 parent genres in the Spotify dataset along with their audio signature distributions"
        icon={Compass}
      />

      {/* Genre Grid Selector */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {genres.map((g) => {
          const isSelected = selectedGenre.toLowerCase() === g.genre_name.toLowerCase();
          return (
            <GenreCard 
              key={g.genre_name} 
              genre={g} 
              isSelected={isSelected} 
              onClick={() => handleGenreSelect(g.genre_name)} 
            />
          );
        })}
      </section>

      {/* Detailed Genre Inspection View */}
      {selectedGenre && (
        <section className="glass-card p-6 rounded-2xl border border-primary/20 space-y-8">
          {detailsLoading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : detailsError ? (
            <ErrorState message="Failed to load genre details." />
          ) : (
            <>
              {/* Profile header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                    Inspecting Genre Profile
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1 capitalize">
                    {genreDetails.genre_name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Aggregate audio statistics computed across {genreDetails.track_count.toLocaleString()} tracks
                  </p>
                </div>
                <div className="shrink-0">
                  <MetricCard 
                    title="Popularity Index" 
                    value={`${Math.round(genreDetails.avg_popularity)}/100`} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Radar Profile */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
                    Acoustic Profile Signature
                  </h4>
                  <div className="w-full bg-[#121212]/30 rounded-xl p-3 border border-border/20">
                    <RadarProfileChart data={genreDetails.audio_profile} name={genreDetails.genre_name} color="#1db954" />
                  </div>

                  {/* Subgenres counts bar list */}
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-6 mb-3 font-mono self-start">
                    Subgenre Breakdown
                  </h4>
                  <div className="w-full space-y-3">
                    {genreDetails.subgenre_breakdown.map((sub) => {
                      const maxCount = Math.max(...genreDetails.subgenre_breakdown.map(s => s.track_count));
                      const percentWidth = (sub.track_count / maxCount) * 100;
                      return (
                        <div key={sub.subgenre} className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="font-semibold text-white capitalize">{sub.subgenre}</span>
                            <span className="text-text-muted">{sub.track_count} tracks</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/75 rounded-full" style={{ width: `${percentWidth}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Top Tracks list */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/20 pb-2 font-mono flex items-center gap-1.5">
                    <Music size={14} className="text-primary" />
                    <span>Popular Tracks in Genre</span>
                  </h4>
                  
                  <div className="divide-y divide-border/20">
                    {genreDetails.top_tracks.map((track, i) => (
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
                            <h5 className="font-semibold text-xs text-white truncate" title={track.track_name}>
                              {track.track_name}
                            </h5>
                            <p className="text-[10px] text-text-muted truncate mt-0.5">
                              {track.track_artist} &bull; <span className="capitalize">{track.playlist_subgenre}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                          <div className="flex items-center gap-0.5 text-accent-gold">
                            <Star size={10} fill="currentColor" />
                            <span>{track.track_popularity}</span>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            C{track.cluster}
                          </span>
                        </div>
                      </div>
                    ))}
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

export default GenreExplorer;
