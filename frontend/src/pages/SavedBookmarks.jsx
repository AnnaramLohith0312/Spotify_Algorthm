import React from 'react';
import { useBookmarks, useRemoveBookmark } from '../hooks/useSpotifyApi';
import { TrackCard } from '../components/Cards';
import { LoadingSkeleton, EmptyState, PageHeader } from '../components/Feedback';
import { Heart } from 'lucide-react';

const SavedBookmarks = () => {
  const { data: bookmarks, isLoading, error } = useBookmarks();
  const removeBookmarkMutation = useRemoveBookmark();

  const handleRemove = (track) => {
    removeBookmarkMutation.mutate(track.track_id);
  };

  return (
    <div className="space-y-6">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Saved Recommendations"
        subtitle="Your bookmarked tracks stored securely on the backend server"
        icon={<Heart className="text-red-500 fill-red-500" size={24} />}
      />

      <div className="pt-4">
        {isLoading ? (
          <LoadingSkeleton type="grid" count={5} />
        ) : error ? (
          <EmptyState 
            title="Failed to load saved items" 
            message={`Error: ${error.message}`}
            iconType="warning"
          />
        ) : bookmarks.length === 0 ? (
          <EmptyState 
            title="No bookmarks saved yet" 
            message="Find tracks using Search or Mood Discovery, then tap the heart icon to save them for later."
            iconType="inbox"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {bookmarks.map((song) => (
              <TrackCard 
                key={song.track_id} 
                track={song} 
                onBookmarkToggle={handleRemove}
                isBookmarked={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedBookmarks;
