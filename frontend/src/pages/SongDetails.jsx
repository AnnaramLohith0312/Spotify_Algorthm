import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useSongDetails, 
  useSongRecommendations, 
  useAddBookmark, 
  useBookmarks, 
  useRemoveBookmark 
} from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork } from '../components/Cards';
import { LoadingSkeleton, ErrorState } from '../components/Feedback';
import { Music, Play, Heart, Star, Calendar, Disc, Activity } from 'lucide-react';

const SongDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: song, isLoading, error } = useSongDetails(id);
  const { data: recData, isLoading: recLoading } = useSongRecommendations(id, 5);

  // Bookmarking integration
  const { data: bookmarks } = useBookmarks();
  const addBookmarkMutation = useAddBookmark();
  const removeBookmarkMutation = useRemoveBookmark();

  const isBookmarked = bookmarks?.some(b => b.track_id === id);

  const handleBookmarkToggle = () => {
    if (!song) return;
    if (isBookmarked) {
      removeBookmarkMutation.mutate(id);
    } else {
      addBookmarkMutation.mutate({
        type: 'song',
        track_id: song.track_id,
        track_name: song.track_name,
        track_artist: song.track_artist,
        playlist_genre: song.playlist_genre,
        track_popularity: song.track_popularity,
        cluster: song.cluster
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={1} />;
  }

  if (error || !song) {
    return <ErrorState message={error?.message || "Track not found."} onRetry={() => navigate('/')} />;
  }

  const AUDIO_FEATURES = [
    { label: "Danceability", key: "danceability", desc: "How suitable a track is for dancing based on tempo, rhythm stability, and beat strength." },
    { label: "Energy", key: "energy", desc: "A perceptual measure of intensity and activity. Fast, loud, and noisy tracks have high energy." },
    { label: "Acousticness", key: "acousticness", desc: "A confidence measure of whether the track is acoustic." },
    { label: "Valence", key: "valence", desc: "A measure of the musical positiveness conveyed by a track. High valence sounds cheerful and happy." },
    { label: "Speechiness", key: "speechiness", desc: "Detects the presence of spoken words in a track. Talk shows or audiobooks approach 1.0." },
    { label: "Instrumentalness", key: "instrumentalness", desc: "Predicts whether a track contains no vocals. Rap or vocal pop approach 0.0." },
    { label: "Liveness", key: "liveness", desc: "Detects the presence of an audience in the recording. High liveness indicates a live performance." }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Back button link */}
      <button 
        onClick={() => navigate(-1)}
        className="text-xs text-text-muted hover:text-white transition duration-200"
      >
        &larr; Back to previous view
      </button>

      {/* Main Track Summary Panel */}
      <section className="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <AlbumArtwork title={song.track_name} sizeClass="w-40 h-40 md:w-48 md:h-48 shadow-2xl" roundedClass="rounded-2xl" />

        <div className="flex-1 space-y-5 text-center md:text-left min-w-0">
          <div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {song.playlist_genre}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                Cluster {song.cluster}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-3 truncate" title={song.track_name}>
              {song.track_name}
            </h2>
            <p 
              onClick={() => navigate(`/artist/${encodeURIComponent(song.track_artist)}`)}
              className="text-lg text-text-muted hover:text-primary transition duration-150 mt-1 cursor-pointer inline-block"
            >
              {song.track_artist}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-text-muted pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Star size={14} className="text-accent-gold fill-accent-gold" />
              <div>
                <span className="text-[9px] text-text-muted/50 block uppercase">Popularity</span>
                <span className="text-white font-bold">{song.track_popularity}/100</span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Disc size={14} className="text-secondary" />
              <div>
                <span className="text-[9px] text-text-muted/50 block uppercase">Album</span>
                <span className="text-white font-bold truncate max-w-[120px] block" title={song.track_album_name}>
                  {song.track_album_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Calendar size={14} className="text-purple-400" />
              <div>
                <span className="text-[9px] text-text-muted/50 block uppercase">Released</span>
                <span className="text-white font-bold">
                  {song.track_album_release_date ? song.track_album_release_date.slice(0, 4) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Activity size={14} className="text-teal-400" />
              <div>
                <span className="text-[9px] text-text-muted/50 block uppercase">Tempo</span>
                <span className="text-white font-bold">{Math.round(song.tempo)} BPM</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start pt-3">
            <button
              onClick={() => navigate(`/recommend/song/${song.track_id}`)}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dim text-black rounded-full font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition duration-200 shadow-lg"
            >
              <Play size={14} fill="currentColor" />
              <span>Get Similar Tracks</span>
            </button>
            
            <button
              onClick={handleBookmarkToggle}
              className={`px-4 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                isBookmarked 
                  ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                  : 'bg-surface border-border text-white hover:border-white/40'
              }`}
            >
              <Heart size={14} className={isBookmarked ? "fill-red-500" : ""} />
              <span>{isBookmarked ? "Saved" : "Save recommendation"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visual Analytics Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive attribute bars */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5">
            Audio DNA Specifications
          </h3>
          <div className="space-y-4">
            {AUDIO_FEATURES.map((feat) => {
              const val = song[feat.key];
              return (
                <div key={feat.key} className="space-y-1" title={feat.desc}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{feat.label}</span>
                    <span className="font-mono text-primary font-bold">{Math.round(val * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${val * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Radar Chart Visualization */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5 w-full text-center">
            Sonic Wave Signature
          </h3>
          <div className="mt-4 w-full">
            <RadarProfileChart data={song} name={song.track_name} color="#1db954" />
          </div>
        </div>
      </section>

      {/* Similar Songs Preview Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Similar Tracks Preview</h3>
        {recLoading ? (
          <LoadingSkeleton type="grid" count={5} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
            {recData?.recommendations?.map((item) => (
              <div 
                key={item.track_id}
                onClick={() => navigate(`/song/${item.track_id}`)}
                className="glass-card p-3 rounded-lg flex flex-col items-center text-center cursor-pointer hover:bg-white/5 border border-transparent hover:border-border transition duration-200"
              >
                <AlbumArtwork title={item.track_name} sizeClass="w-16 h-16 rounded" />
                <h4 className="font-semibold text-xs text-white truncate w-full mt-2" title={item.track_name}>
                  {item.track_name}
                </h4>
                <p className="text-[10px] text-text-muted truncate w-full mt-0.5">
                  {item.track_artist}
                </p>
                <span className="text-[9px] font-mono text-primary font-bold mt-2 bg-primary/10 px-1.5 py-0.5 rounded">
                  {Math.round(item.similarity * 100)}% Sim
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SongDetails;
