import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch, useAddBookmark, useBookmarks, useRemoveBookmark } from '../hooks/useSpotifyApi';
import { TrackCard, ArtistCard, PlaylistCard } from '../components/Cards';
import { LoadingSkeleton, EmptyState, PageHeader } from '../components/Feedback';
import { Music, User, Layers, Search } from 'lucide-react';

const SearchResults = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('songs');
  
  // Extract search query q
  const getQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  };
  
  const query = getQuery();
  const { data, isLoading, error, refetch } = useSearch(query);

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

  // Casing of active tab
  useEffect(() => {
    refetch();
  }, [query, refetch]);

  if (!query) {
    return (
      <EmptyState 
        title="Start searching" 
        message="Enter a track title, artist name, or playlist description in the search bar above to begin."
        iconType="compass"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Reusable PageHeader */}
      <PageHeader 
        title={<span>Search Results for <span className="text-primary">"{query}"</span></span>}
        subtitle="Interactive query matched from our cleaned Spotify dataset"
        icon={Search}
      />

      {/* Tabs list */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab('songs')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'songs' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <Music size={16} />
          <span>Songs {data?.songs ? `(${data.songs.length})` : ''}</span>
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'artists' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <User size={16} />
          <span>Artists {data?.artists ? `(${data.artists.length})` : ''}</span>
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'playlists' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-white'
          }`}
        >
          <Layers size={16} />
          <span>Playlists {data?.playlists ? `(${data.playlists.length})` : ''}</span>
        </button>
      </div>

      {/* Content wrapper */}
      <div className="pt-4">
        {isLoading ? (
          <LoadingSkeleton type="grid" count={10} />
        ) : error ? (
          <EmptyState 
            title="Failed to fetch" 
            message={`Error: ${error.message}. Please verify the backend is running.`}
            iconType="warning"
          />
        ) : (
          <>
            {activeTab === 'songs' && (
              data.songs.length === 0 ? (
                <EmptyState title="No matching songs" message="We couldn't find any songs matching your search." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {data.songs.map((song) => (
                    <TrackCard 
                      key={song.track_id} 
                      track={song} 
                      onBookmarkToggle={handleBookmarkToggle}
                      isBookmarked={isItemBookmarked(song.track_id)}
                    />
                  ))}
                </div>
              )
            )}

            {activeTab === 'artists' && (
              data.artists.length === 0 ? (
                <EmptyState title="No matching artists" message="We couldn't find any artists matching your search." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {data.artists.map((artist) => (
                    <ArtistCard key={artist.artist_name} artist={artist} />
                  ))}
                </div>
              )
            )}

            {activeTab === 'playlists' && (
              data.playlists.length === 0 ? (
                <EmptyState title="No matching playlists" message="We couldn't find any playlists matching your search." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {data.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.playlist_name} playlist={playlist} />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
