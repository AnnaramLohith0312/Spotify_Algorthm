import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompareSongs, useSearch } from '../hooks/useSpotifyApi';
import { RadarProfileChart } from '../components/Visuals';
import { AlbumArtwork } from '../components/Cards';
import { LoadingSkeleton, ErrorState, EmptyState, PageHeader } from '../components/Feedback';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Columns, Music, Star, Search, Sparkles } from 'lucide-react';

const SongComparison = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id1 = searchParams.get('id1') || '';
  const id2 = searchParams.get('id2') || '';

  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  
  const { data: searchResults1 } = useSearch(searchQuery1);
  const { data: searchResults2 } = useSearch(searchQuery2);

  const { data: comparison, isLoading, error } = useCompareSongs(id1, id2);

  const handleSelectSong = (num, trackId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`id${num}`, trackId);
    setSearchParams(newParams);
    if (num === 1) setSearchQuery1('');
    if (num === 2) setSearchQuery2('');
  };

  const AUDIO_FEATURES = [
    { label: "Danceability", key: "danceability" },
    { label: "Energy", key: "energy" },
    { label: "Acousticness", key: "acousticness" },
    { label: "Valence", key: "valence" },
    { label: "Speechiness", key: "speechiness" },
    { label: "Instrumentalness", key: "instrumentalness" },
    { label: "Liveness", key: "liveness" }
  ];

  // Radar Data Formatter for Multi-radar comparison
  const getRadarData = () => {
    if (!comparison) return [];
    return AUDIO_FEATURES.map(feat => ({
      subject: feat.label,
      [comparison.song1.track_name]: comparison.song1[feat.key],
      [comparison.song2.track_name]: comparison.song2[feat.key],
      fullMark: 1.0
    }));
  };

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Track Comparison Engine"
        subtitle="Mathematically compute the differences between two sonic footprints in our database"
        icon={Columns}
      />

      {/* Inputs selectors for song selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector 1 */}
        <div className="space-y-2 relative">
          <label className="text-xs font-semibold text-text-muted font-mono uppercase block">First Track</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search first song..."
              value={searchQuery1}
              onChange={(e) => setSearchQuery1(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
          </div>

          {searchQuery1 && searchResults1?.songs && (
            <div className="absolute left-0 right-0 mt-1 bg-surface-elevated border border-border rounded-lg max-h-48 overflow-y-auto z-40 shadow-xl">
              {searchResults1.songs.slice(0, 5).map(song => (
                <div
                  key={song.track_id}
                  onClick={() => handleSelectSong(1, song.track_id)}
                  className="p-2.5 flex items-center gap-3 hover:bg-white/5 cursor-pointer border-b border-border/20 text-xs"
                >
                  <AlbumArtwork title={song.track_name} sizeClass="w-8 h-8" />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{song.track_name}</div>
                    <div className="text-[10px] text-text-muted truncate">{song.track_artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selector 2 */}
        <div className="space-y-2 relative">
          <label className="text-xs font-semibold text-text-muted font-mono uppercase block">Second Track</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search second song..."
              value={searchQuery2}
              onChange={(e) => setSearchQuery2(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
          </div>

          {searchQuery2 && searchResults2?.songs && (
            <div className="absolute left-0 right-0 mt-1 bg-surface-elevated border border-border rounded-lg max-h-48 overflow-y-auto z-40 shadow-xl">
              {searchResults2.songs.slice(0, 5).map(song => (
                <div
                  key={song.track_id}
                  onClick={() => handleSelectSong(2, song.track_id)}
                  className="p-2.5 flex items-center gap-3 hover:bg-white/5 cursor-pointer border-b border-border/20 text-xs"
                >
                  <AlbumArtwork title={song.track_name} sizeClass="w-8 h-8" />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{song.track_name}</div>
                    <div className="text-[10px] text-text-muted truncate">{song.track_artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison results */}
      {id1 && id2 ? (
        isLoading ? (
          <LoadingSkeleton type="grid" count={2} />
        ) : error ? (
          <ErrorState message="Could not fetch song comparison details." />
        ) : (
          <div className="space-y-8">
            {/* Header Cards side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Song 1 Info */}
              <div 
                onClick={() => navigate(`/song/${comparison.song1.track_id}`)}
                className="glass-card p-5 rounded-xl border border-primary/20 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition duration-200"
              >
                <AlbumArtwork title={comparison.song1.track_name} sizeClass="w-16 h-16 rounded-lg" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">Track A</span>
                  <h3 className="font-bold text-white truncate" title={comparison.song1.track_name}>{comparison.song1.track_name}</h3>
                  <p className="text-xs text-text-muted truncate">{comparison.song1.track_artist}</p>
                </div>
              </div>

              {/* Song 2 Info */}
              <div 
                onClick={() => navigate(`/song/${comparison.song2.track_id}`)}
                className="glass-card p-5 rounded-xl border border-secondary/20 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition duration-200"
              >
                <AlbumArtwork title={comparison.song2.track_name} sizeClass="w-16 h-16 rounded-lg" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-secondary tracking-wider font-mono">Track B</span>
                  <h3 className="font-bold text-white truncate" title={comparison.song2.track_name}>{comparison.song2.track_name}</h3>
                  <p className="text-xs text-text-muted truncate">{comparison.song2.track_artist}</p>
                </div>
              </div>
            </div>

            {/* Radar Comparison and Attribute Table splits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar comparison chart */}
              <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center h-[350px]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
                  Dual Wave Signature
                </h4>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                      <PolarGrid stroke="#2a2a2a" />
                      <PolarAngleAxis tick={{ fill: '#b3b3b3', fontSize: 9 }} dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 1.0]} stroke="#2a2a2a" tick={{ fill: '#b3b3b3', fontSize: 8 }} />
                      <Radar
                        name={comparison.song1.track_name}
                        dataKey={comparison.song1.track_name}
                        stroke="#1db954"
                        fill="#1db954"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name={comparison.song2.track_name}
                        dataKey={comparison.song2.track_name}
                        stroke="#4a90d9"
                        fill="#4a90d9"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attribute detail bar chart list */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2 font-mono flex items-center gap-1.5">
                  <Music size={14} className="text-primary" />
                  <span>Acoustic Spec Comparison</span>
                </h4>
                
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
                  {AUDIO_FEATURES.map((feat) => {
                    const delta = comparison.deltas[feat.key];
                    return (
                      <div key={feat.key} className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-semibold text-white">{feat.label}</span>
                          <span className={`${delta.difference > 0 ? 'text-secondary' : delta.difference < 0 ? 'text-primary' : 'text-white'}`}>
                            {delta.difference > 0 ? 'B +' : delta.difference < 0 ? 'A +' : ''}
                            {Math.round(delta.abs_difference * 100)}% Diff
                          </span>
                        </div>
                        {/* Dual bar overlay */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 text-[9px] text-text-muted font-mono">A</span>
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${delta.val1 * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono text-[9px] text-white">{Math.round(delta.val1 * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 text-[9px] text-text-muted font-mono">B</span>
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary" style={{ width: `${delta.val2 * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono text-[9px] text-white">{Math.round(delta.val2 * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <EmptyState 
          title="Select two tracks" 
          message="Use the search inputs above to select two tracks from the dataset to compare their acoustic specifications."
          iconType="compass"
        />
      )}
    </div>
  );
};

export default SongComparison;
