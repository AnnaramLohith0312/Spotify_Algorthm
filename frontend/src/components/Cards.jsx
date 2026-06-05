import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Music, BarChart2, Star, User } from 'lucide-react';

// Helper component for elegant cover artwork placeholders
export const AlbumArtwork = ({ title = '', sizeClass = 'w-12 h-12', roundedClass = 'rounded' }) => {
  const getGradient = (seed) => {
    const colors = [
      'from-[#1db954] to-[#0a3316]', // Emerald
      'from-[#4a90d9] to-[#0b2447]', // Blue
      'from-[#e74c3c] to-[#40120e]', // Red
      'from-[#f39c12] to-[#3a2003]', // Gold
      'from-[#9b59b6] to-[#250d30]', // Purple
      'from-[#1abc9c] to-[#052d25]', // Teal
      'from-[#ec4899] to-[#3b071e]'  // Pink
    ];
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  const gradient = getGradient(title);
  const initials = title ? title.slice(0, 2).toUpperCase() : 'IQ';

  return (
    <div className={`${sizeClass} ${roundedClass} bg-gradient-to-br ${gradient} flex items-center justify-center text-white/80 font-bold select-none text-xs tracking-wider shrink-0 border border-white/5`}>
      {initials}
    </div>
  );
};

export const TrackCard = ({ track, onBookmarkToggle, isBookmarked }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card glass-card-hover p-4 rounded-xl flex flex-col gap-3 group relative cursor-pointer" onClick={() => navigate(`/song/${track.track_id}`)}>
      {/* Cover Image Wrapper */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-elevated">
        <AlbumArtwork title={track.track_name} sizeClass="w-full h-full" roundedClass="rounded-lg" />
        
        {/* Hover play button */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/recommend/song/${track.track_id}`);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-105"
          title="Get recommendations"
        >
          <Play size={18} fill="currentColor" className="ml-0.5" />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col min-w-0">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-primary transition duration-200" title={track.track_name}>
          {track.track_name}
        </h3>
        <p className="text-xs text-text-muted truncate mt-0.5" title={track.track_artist}>
          {track.track_artist}
        </p>
      </div>

      {/* Footer stats / badges */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-auto">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          C{track.cluster}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-xs text-text-muted" title={`Popularity: ${track.track_popularity}`}>
            <Star size={12} className="text-accent-gold fill-accent-gold" />
            <span>{track.track_popularity}</span>
          </div>
          {onBookmarkToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(track);
              }}
              className="text-text-muted hover:text-red-500 hover:scale-110 transition duration-200"
            >
              <Heart size={14} className={isBookmarked ? "text-red-500 fill-red-500" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-card glass-card-hover p-4 rounded-xl flex flex-col gap-3 group relative cursor-pointer"
      onClick={() => navigate(`/artist/${encodeURIComponent(artist.artist_name)}`)}
    >
      {/* Circle artwork for artists */}
      <div className="relative aspect-square w-full rounded-full overflow-hidden bg-surface-elevated max-w-[150px] mx-auto">
        <AlbumArtwork title={artist.artist_name} sizeClass="w-full h-full" roundedClass="rounded-full" />
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/recommend/artist/${encodeURIComponent(artist.artist_name)}`);
          }}
          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-105"
          title="Get artist recommendations"
        >
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col text-center">
        <h3 className="font-semibold text-sm text-white truncate" title={artist.artist_name}>
          {artist.artist_name}
        </h3>
        <span className="text-[10px] text-text-muted font-mono mt-1">
          {artist.track_count} Tracks in Dataset
        </span>
      </div>

      {/* dominant cluster badge */}
      <div className="flex flex-col items-center gap-1 border-t border-border/40 pt-2.5 mt-auto">
        <span className="text-[10px] text-text-muted">Dominant Style</span>
        <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20 truncate max-w-full">
          {artist.dominant_cluster_name}
        </span>
      </div>
    </div>
  );
};

export const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-card glass-card-hover p-4 rounded-xl flex flex-col gap-3 group relative cursor-pointer"
      onClick={() => navigate(`/explore/playlists?name=${encodeURIComponent(playlist.playlist_name)}`)}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-elevated">
        <AlbumArtwork title={playlist.playlist_name} sizeClass="w-full h-full" roundedClass="rounded-lg" />
      </div>

      <div className="flex flex-col">
        <h3 className="font-semibold text-sm text-white truncate" title={playlist.playlist_name}>
          {playlist.playlist_name}
        </h3>
        <p className="text-xs text-text-muted mt-0.5 truncate capitalize">
          {playlist.playlist_genre} &bull; {playlist.playlist_subgenre}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-auto text-[10px] text-text-muted">
        <span>{playlist.track_count} Songs</span>
        {playlist.avg_popularity && (
          <div className="flex items-center gap-0.5">
            <Star size={10} className="text-accent-gold" />
            <span>Avg Pop: {Math.round(playlist.avg_popularity)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ClusterCard = ({ cluster, isActive, onClick }) => {
  const navigate = useNavigate();
  
  const colors = [
    'border-[#1db954]/30 hover:border-[#1db954]/60 bg-[#1db954]/5 text-[#1db954]', // C0
    'border-[#4a90d9]/30 hover:border-[#4a90d9]/60 bg-[#4a90d9]/5 text-[#4a90d9]', // C1
    'border-[#e74c3c]/30 hover:border-[#e74c3c]/60 bg-[#e74c3c]/5 text-[#e74c3c]', // C2
    'border-[#f39c12]/30 hover:border-[#f39c12]/60 bg-[#f39c12]/5 text-[#f39c12]', // C3
    'border-[#9b59b6]/30 hover:border-[#9b59b6]/60 bg-[#9b59b6]/5 text-[#9b59b6]', // C4
    'border-[#1abc9c]/30 hover:border-[#1abc9c]/60 bg-[#1abc9c]/5 text-[#1abc9c]'  // C5
  ];
  
  const borderCol = colors[cluster.cluster_id] || 'border-border';

  return (
    <div 
      className={`glass-card p-5 rounded-xl border flex flex-col gap-4 group transition-all duration-300 ${borderCol} ${
        isActive ? 'ring-2 ring-primary/40' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded text-white/90">
          Cluster #{cluster.cluster_id}
        </span>
        <span className="text-xs text-text-muted font-mono">{cluster.track_count} Tracks</span>
      </div>

      <div>
        <h3 className="font-bold text-base text-white group-hover:text-primary transition duration-200">
          {cluster.cluster_name}
        </h3>
        <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
          {cluster.description}
        </p>
      </div>

      {cluster.audio_profile && (
        <div className="grid grid-cols-3 gap-2 border-t border-border/30 pt-3 text-[10px] font-mono text-text-muted">
          <div>
            <div className="text-[9px] text-text-muted/60 uppercase">Dance</div>
            <div className="text-white font-semibold">{Math.round(cluster.audio_profile.danceability * 100)}%</div>
          </div>
          <div>
            <div className="text-[9px] text-text-muted/60 uppercase">Energy</div>
            <div className="text-white font-semibold">{Math.round(cluster.audio_profile.energy * 100)}%</div>
          </div>
          <div>
            <div className="text-[9px] text-text-muted/60 uppercase">Tempo</div>
            <div className="text-white font-semibold">{Math.round(cluster.audio_profile.tempo)} BPM</div>
          </div>
        </div>
      )}

      <div className="flex gap-2.5 mt-auto pt-2">
        <button 
          onClick={() => {
            if (onClick) onClick(cluster.cluster_id);
            else navigate(`/explore/clusters/${cluster.cluster_id}`);
          }}
          className="flex-1 text-center py-2 rounded bg-surface-elevated hover:bg-surface border border-border/50 text-xs font-semibold text-white transition duration-200"
        >
          View Profile
        </button>
        <button 
          onClick={() => navigate(`/analytics/clusters?cluster=${cluster.cluster_id}`)}
          className="px-3 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center transition duration-200"
          title="See analytics details"
        >
          <BarChart2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const GenreCard = ({ genre, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-4 rounded-xl border flex flex-col justify-between h-32 cursor-pointer transition duration-300 ${
        isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border/40 hover:border-white/20'
      }`}
    >
      <div>
        <h4 className="font-bold text-base text-white capitalize">{genre.genre_name}</h4>
        <span className="text-[10px] text-text-muted font-mono">{genre.track_count.toLocaleString()} Tracks</span>
      </div>

      <div className="border-t border-border/30 pt-2 text-[10px] font-mono text-text-muted flex justify-between items-center mt-3">
        <span>Avg Pop</span>
        <span className="text-white font-bold">{Math.round(genre.avg_popularity)}</span>
      </div>
    </div>
  );
};

export const MetricCard = ({ title, value, icon: Icon, color = 'text-primary', subtitle }) => {
  return (
    <div className="glass-card p-5 rounded-xl flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-lg bg-white/5 border border-border/40 ${color}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase font-bold text-text-muted font-mono tracking-wider truncate">{title}</div>
        <div className="text-xl font-bold text-white mt-0.5 truncate">{value}</div>
        {subtitle && <p className="text-[10px] text-text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
};

export const InsightCard = ({ title, description, icon: Icon, color = 'text-primary', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card glass-card-hover p-6 rounded-xl flex flex-col gap-3 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {Icon && (
        <div className={`p-3 rounded-lg bg-white/5 w-fit ${color}`}>
          <Icon size={20} />
        </div>
      )}
      <h4 className="font-bold text-base text-white group-hover:text-primary transition duration-200">
        {title}
      </h4>
      <p className="text-xs text-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const AutocompleteRow = ({ title, subtitle, type, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition duration-150 min-w-0"
    >
      <AlbumArtwork title={title} sizeClass="w-8 h-8" roundedClass="rounded" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{title}</div>
        <div className="text-[10px] text-text-muted truncate mt-0.5">{subtitle}</div>
      </div>
      {type && (
        <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/70 shrink-0">
          {type}
        </span>
      )}
    </div>
  );
};

export const SongCard = TrackCard;

