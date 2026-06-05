import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useSongDetails, 
  useSongRecommendations, 
  useAddBookmark, 
  useBookmarks, 
  useRemoveBookmark 
} from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork, TrackCard } from '../components/Cards';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { Info, Sparkles, Star, Layers, Calendar, ChevronDown, ChevronUp, BarChart2, Heart } from 'lucide-react';

const SongRecommendations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topN, setTopN] = useState(10);
  const [expandedRecId, setExpandedRecId] = useState(null);

  const { data: details, isLoading: detailsLoading, error: detailsError } = useSongDetails(id);
  const { data: recData, isLoading: recLoading, error: recError } = useSongRecommendations(id, topN);

  // Bookmarking integration
  const { data: bookmarks } = useBookmarks();
  const addBookmarkMutation = useAddBookmark();
  const removeBookmarkMutation = useRemoveBookmark();

  const isItemBookmarked = (trackId) => {
    if (!bookmarks) return false;
    return bookmarks.some(b => b.track_id === trackId);
  };

  const handleBookmarkToggle = (track) => {
    if (isItemBookmarked(track.track_id)) {
      removeBookmarkMutation.mutate(track.track_id);
    } else {
      addBookmarkMutation.mutate({
        type: 'song',
        track_id: track.track_id,
        track_name: track.track_name,
        track_artist: track.track_artist,
        playlist_genre: track.playlist_genre,
        track_popularity: track.track_popularity,
        cluster: track.cluster
      });
    }
  };

  if (detailsLoading || recLoading) {
    return <LoadingSkeleton type="grid" count={5} />;
  }

  if (detailsError || recError) {
    return <ErrorState message={detailsError?.message || recError?.message} onRetry={() => navigate('/')} />;
  }

  const querySong = recData?.query_song || details;
  const recommendations = recData?.recommendations || [];

  const AUDIO_FEATURES = [
    { label: "Danceability", key: "danceability" },
    { label: "Energy", key: "energy" },
    { label: "Acousticness", key: "acousticness" },
    { label: "Valence", key: "valence" },
    { label: "Speechiness", key: "speechiness" },
    { label: "Instrumentalness", key: "instrumentalness" },
    { label: "Liveness", key: "liveness" }
  ];

  const toggleExplain = (recId) => {
    setExpandedRecId(expandedRecId === recId ? null : recId);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Explainable Music Recommendations"
        subtitle="Content-based similarity model constrained by KMeans cluster boundaries"
        icon={Sparkles}
      />

      {/* Query Song Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Song Meta */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <AlbumArtwork title={querySong.track_name} sizeClass="w-36 h-36 md:w-44 md:h-44" roundedClass="rounded-xl shadow-2xl" />
          
          <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Source Track
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-3 truncate" title={querySong.track_name}>
                {querySong.track_name}
              </h3>
              <p 
                onClick={() => navigate(`/artist/${encodeURIComponent(querySong.track_artist)}`)}
                className="text-base text-text-muted hover:text-primary cursor-pointer transition duration-200 mt-1 inline-block"
              >
                {querySong.track_artist}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-border/40 pt-4 font-mono text-text-muted">
              <div>
                <span className="text-[10px] text-text-muted/50 block uppercase">Cluster</span>
                <span className="text-white font-bold">{querySong.playlist_genre} &bull; C{querySong.cluster}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted/50 block uppercase">Popularity</span>
                <span className="text-white font-bold flex items-center justify-center md:justify-start gap-1">
                  <Star size={12} className="text-accent-gold fill-accent-gold" />
                  <span>{querySong.track_popularity}/100</span>
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-text-muted/50 block uppercase">Release Year</span>
                <span className="text-white font-bold">
                  {querySong.track_album_release_date ? querySong.track_album_release_date.slice(0, 4) : 'N/A'}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-text-muted truncate">
              Album: <span className="text-white font-medium">{querySong.track_album_name}</span>
            </p>
          </div>
        </div>

        {/* Right: Audio Signature Radar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center items-center">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">
            Audio DNA Signature
          </h4>
          <RadarProfileChart data={querySong} name="Query Song" color="#1db954" />
        </div>
      </section>

      {/* Recommendations Results List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart2 size={18} className="text-primary" />
            <span>Top Similar Matches</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">List Limit:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-surface-elevated border border-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>

        {/* Recommendations list table-style container */}
        <div className="space-y-3.5 select-none">
          {recommendations.map((rec, index) => {
            const isExpanded = expandedRecId === rec.track_id;
            
            return (
              <div 
                key={rec.track_id}
                className="glass-card rounded-xl border border-border/30 hover:border-primary/20 overflow-hidden transition-all duration-300"
              >
                {/* Main Row */}
                <div 
                  onClick={() => toggleExplain(rec.track_id)}
                  className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4 min-w-0 w-full md:w-2/5">
                    <span className="text-sm font-mono font-bold text-text-muted w-5 text-center shrink-0">
                      {index + 1}
                    </span>
                    <AlbumArtwork title={rec.track_name} sizeClass="w-10 h-10" />
                    <div className="min-w-0">
                      <h4 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/song/${rec.track_id}`);
                        }}
                        className="font-semibold text-sm text-white truncate hover:text-primary transition duration-150"
                        title={rec.track_name}
                      >
                        {rec.track_name}
                      </h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/artist/${encodeURIComponent(rec.track_artist)}`);
                        }}
                        className="text-xs text-text-muted truncate hover:underline mt-0.5"
                      >
                        {rec.track_artist}
                      </p>
                    </div>
                  </div>

                  {/* Similarity Metrics Columns */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-3/5 text-xs font-mono">
                    {/* Explainability Match Badges */}
                    <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                      {AUDIO_FEATURES.map(feat => {
                        const diff = Math.abs(querySong[feat.key] - rec[feat.key]);
                        if (diff < 0.05) {
                          return (
                            <span 
                              key={feat.key}
                              className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20 uppercase"
                              title={`${feat.label} difference is only ${Math.round(diff * 100)}%`}
                            >
                              {feat.label.slice(0, 5)} Match
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-text-muted/50 block uppercase">Cosine Sim</span>
                      <span className="text-white font-bold">{(rec.similarity * 100).toFixed(1)}%</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-text-muted/50 block uppercase">Weighted Score</span>
                      <span className="text-primary font-bold">{(rec.final_score * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center gap-3 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(rec);
                        }}
                        className="text-text-muted hover:text-red-500 transition duration-200"
                        title={isItemBookmarked(rec.track_id) ? "Remove Bookmark" : "Save recommendation"}
                      >
                        <Heart size={14} className={isItemBookmarked(rec.track_id) ? "text-red-500 fill-red-500" : ""} />
                      </button>
                      
                      <button 
                        className="text-text-muted hover:text-white"
                        title="Why recommended?"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Explainability Panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-border/20 bg-black/40 text-xs text-text-muted space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Info size={14} />
                      <span>Why this song was recommended:</span>
                    </div>
                    
                    <p className="leading-relaxed">
                      This song shares the cluster <span className="text-white font-semibold">C{rec.cluster}</span> with the source track, indicating similar overall production style. The cosine similarity of their audio vectors is <span className="text-white font-semibold">{(rec.similarity * 100).toFixed(2)}%</span>. The recommendation final score incorporates a <span className="text-white font-semibold">15% popularity weight</span> to favor well-received tracks in this style.
                    </p>

                    {/* Features side-by-side comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
                      {AUDIO_FEATURES.slice(0, 4).map(feat => {
                        const qVal = querySong[feat.key];
                        const rVal = rec[feat.key];
                        const difference = Math.abs(qVal - rVal);
                        
                        return (
                          <div key={feat.key} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-medium text-white">{feat.label}</span>
                              <span className="text-text-muted font-mono">
                                Diff: {Math.round(difference * 100)}%
                              </span>
                            </div>
                            <div className="h-2 rounded bg-white/5 relative overflow-hidden flex">
                              {/* Source track value indicator */}
                              <div 
                                style={{ width: `${qVal * 100}%` }}
                                className="h-full bg-white/10 border-r border-white/40 absolute left-0 z-10"
                              />
                              {/* Recommended track value indicator */}
                              <div 
                                style={{ width: `${rVal * 100}%` }}
                                className="h-full bg-primary/40 border-r border-primary absolute left-0"
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-text-muted/60 font-mono">
                              <span>Source: {Math.round(qVal * 100)}%</span>
                              <span>Match: {Math.round(rVal * 100)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SongRecommendations;
