import React, { useState } from 'react';
import { useMoodRecommendations } from '../hooks/useSpotifyApi';
import { TrackCard } from '../components/Cards';
import { LoadingSkeleton, EmptyState, PageHeader } from '../components/Feedback';
import { FilterChip, DropdownFilter, SliderFilter } from '../components/Controls';
import { Sliders, HelpCircle, Star, Music, Heart } from 'lucide-react';
import { useAddBookmark, useBookmarks, useRemoveBookmark } from '../hooks/useSpotifyApi';

const MoodDiscovery = () => {
  const [mood, setMood] = useState({
    danceability: 0.6,
    energy: 0.6,
    speechiness: 0.1,
    acousticness: 0.2,
    instrumentalness: 0.1,
    liveness: 0.15,
    valence: 0.5,
    tempo: 120,
    loudness: -8.0
  });

  const [genreFilter, setGenreFilter] = useState('');
  
  const { data: recommendations, isLoading, error } = useMoodRecommendations(mood, genreFilter, 15);

  // Bookmarking integration
  const { data: bookmarks } = useBookmarks();
  const addBookmarkMutation = useAddBookmark();
  const removeBookmarkMutation = useRemoveBookmark();

  const isItemBookmarked = (trackId) => {
    return bookmarks?.some(b => b.track_id === trackId) || false;
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

  const moodPresets = [
    {
      name: "Chill Vibe",
      values: { danceability: 0.5, energy: 0.35, speechiness: 0.05, acousticness: 0.65, instrumentalness: 0.2, liveness: 0.1, valence: 0.45, tempo: 95, loudness: -11.0 }
    },
    {
      name: "Club Party",
      values: { danceability: 0.82, energy: 0.85, speechiness: 0.08, acousticness: 0.04, instrumentalness: 0.05, liveness: 0.18, valence: 0.72, tempo: 124, loudness: -5.0 }
    },
    {
      name: "Happy / Uplifting",
      values: { danceability: 0.72, energy: 0.75, speechiness: 0.06, acousticness: 0.12, instrumentalness: 0.01, liveness: 0.14, valence: 0.86, tempo: 118, loudness: -6.0 }
    },
    {
      name: "Workout EDM",
      values: { danceability: 0.64, energy: 0.92, speechiness: 0.07, acousticness: 0.02, instrumentalness: 0.35, liveness: 0.22, valence: 0.42, tempo: 130, loudness: -4.5 }
    },
    {
      name: "Raw Acoustic",
      values: { danceability: 0.48, energy: 0.24, speechiness: 0.04, acousticness: 0.88, instrumentalness: 0.0, liveness: 0.12, valence: 0.38, tempo: 88, loudness: -13.0 }
    },
    {
      name: "Dark Melancholic",
      values: { danceability: 0.52, energy: 0.45, speechiness: 0.04, acousticness: 0.22, instrumentalness: 0.68, liveness: 0.09, valence: 0.12, tempo: 112, loudness: -9.5 }
    }
  ];

  const handleSliderChange = (key, val) => {
    setMood(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const applyPreset = (values) => {
    setMood(values);
  };

  const isPresetActive = (presetValues) => {
    return Object.keys(presetValues).every(k => mood[k] === presetValues[k]);
  };

  const genreOptions = [
    { value: "", label: "All Genres" },
    { value: "pop", label: "Pop" },
    { value: "rap", label: "Rap" },
    { value: "rock", label: "Rock" },
    { value: "latin", label: "Latin" },
    { value: "r&b", label: "R&B" },
    { value: "edm", label: "EDM" }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Mood & Attribute Discovery"
        subtitle="Discover tracks by setting custom target audio features. Powered by cosine similarity vector metrics."
        icon={Sliders}
      />

      {/* Preset Mood chips */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Vibe Presets</h4>
        <div className="flex flex-wrap gap-2.5">
          {moodPresets.map((preset) => (
            <FilterChip
              key={preset.name}
              label={preset.name}
              isActive={isPresetActive(preset.values)}
              onClick={() => applyPreset(preset.values)}
            />
          ))}
        </div>
      </section>

      {/* Main control panel + results layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Sliders */}
        <div className="glass-card p-6 rounded-2xl space-y-6 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5">
            Configure Audio Vector
          </h3>

          <div className="space-y-5">
            {/* Reusable Dropdown Genre Filter */}
            <DropdownFilter 
              label="Filter Genre"
              value={genreFilter}
              options={genreOptions}
              onChange={setGenreFilter}
            />

            {/* Reusable Slider Filters */}
            <SliderFilter 
              label="Danceability"
              value={mood.danceability}
              min={0.0}
              max={1.0}
              step={0.05}
              unit="%"
              onChange={(val) => handleSliderChange('danceability', val)}
            />

            <SliderFilter 
              label="Energy"
              value={mood.energy}
              min={0.0}
              max={1.0}
              step={0.05}
              unit="%"
              onChange={(val) => handleSliderChange('energy', val)}
            />

            <SliderFilter 
              label="Valence (Happiness)"
              value={mood.valence}
              min={0.0}
              max={1.0}
              step={0.05}
              unit="%"
              onChange={(val) => handleSliderChange('valence', val)}
            />

            <SliderFilter 
              label="Acousticness"
              value={mood.acousticness}
              min={0.0}
              max={1.0}
              step={0.05}
              unit="%"
              onChange={(val) => handleSliderChange('acousticness', val)}
            />

            <SliderFilter 
              label="Instrumentalness"
              value={mood.instrumentalness}
              min={0.0}
              max={1.0}
              step={0.05}
              unit="%"
              onChange={(val) => handleSliderChange('instrumentalness', val)}
            />

            <SliderFilter 
              label="Tempo (BPM)"
              value={mood.tempo}
              min={50}
              max={220}
              step={5}
              unit=" BPM"
              onChange={(val) => handleSliderChange('tempo', val)}
            />
          </div>
        </div>


        {/* Right column: matching tracks */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2.5 flex items-center gap-2">
            <Music size={14} className="text-primary" />
            <span>Matching Discovery Results</span>
          </h3>

          {isLoading ? (
            <LoadingSkeleton type="list" count={8} />
          ) : error ? (
            <EmptyState 
              title="Failed to fetch discoveries" 
              message={error.message}
              iconType="warning"
            />
          ) : recommendations.length === 0 ? (
            <EmptyState 
              title="No matches found" 
              message="Try relaxing your sliders or selecting a different genre filter."
              iconType="inbox"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommendations.map((song) => (
                <TrackCard 
                  key={song.track_id} 
                  track={song} 
                  onBookmarkToggle={handleBookmarkToggle}
                  isBookmarked={isItemBookmarked(song.track_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodDiscovery;
