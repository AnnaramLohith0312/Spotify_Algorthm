import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompareArtists, useSearch } from '../hooks/useSpotifyApi';
import { AlbumArtwork } from '../components/Cards';
import { LoadingSkeleton, EmptyState, ErrorState, PageHeader } from '../components/Feedback';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Columns, User, Star, Search, Sparkles } from 'lucide-react';

const ArtistComparison = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const name1 = searchParams.get('name1') || '';
  const name2 = searchParams.get('name2') || '';

  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  
  const { data: searchResults1 } = useSearch(searchQuery1);
  const { data: searchResults2 } = useSearch(searchQuery2);

  const { data: comparison, isLoading, error } = useCompareArtists(name1, name2);

  const handleSelectArtist = (num, artistName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`name${num}`, artistName);
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
      [comparison.artist1.artist_name]: comparison.artist1.fingerprint[feat.key],
      [comparison.artist2.artist_name]: comparison.artist2.fingerprint[feat.key],
      fullMark: 1.0
    }));
  };

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Artist Fingerprint Comparison"
        subtitle="Compare the average acoustic DNA profiles of two different artists"
        icon={() => <Columns className="text-secondary" size={24} />}
      />

      {/* Inputs selectors for artist selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector 1 */}
        <div className="space-y-2 relative">
          <label className="text-xs font-semibold text-text-muted font-mono uppercase block">First Artist</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search first artist..."
              value={searchQuery1}
              onChange={(e) => setSearchQuery1(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
          </div>

          {searchQuery1 && searchResults1?.artists && (
            <div className="absolute left-0 right-0 mt-1 bg-surface-elevated border border-border rounded-lg max-h-48 overflow-y-auto z-40 shadow-xl">
              {searchResults1.artists.slice(0, 5).map(art => (
                <div
                  key={art.artist_name}
                  onClick={() => handleSelectArtist(1, art.artist_name)}
                  className="p-2.5 flex items-center gap-3 hover:bg-white/5 cursor-pointer border-b border-border/20 text-xs"
                >
                  <AlbumArtwork title={art.artist_name} sizeClass="w-8 h-8 rounded-full" />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{art.artist_name}</div>
                    <div className="text-[10px] text-text-muted truncate">{art.track_count} Tracks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selector 2 */}
        <div className="space-y-2 relative">
          <label className="text-xs font-semibold text-text-muted font-mono uppercase block">Second Artist</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search second artist..."
              value={searchQuery2}
              onChange={(e) => setSearchQuery2(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
          </div>

          {searchQuery2 && searchResults2?.artists && (
            <div className="absolute left-0 right-0 mt-1 bg-surface-elevated border border-border rounded-lg max-h-48 overflow-y-auto z-40 shadow-xl">
              {searchResults2.artists.slice(0, 5).map(art => (
                <div
                  key={art.artist_name}
                  onClick={() => handleSelectArtist(2, art.artist_name)}
                  className="p-2.5 flex items-center gap-3 hover:bg-white/5 cursor-pointer border-b border-border/20 text-xs"
                >
                  <AlbumArtwork title={art.artist_name} sizeClass="w-8 h-8 rounded-full" />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{art.artist_name}</div>
                    <div className="text-[10px] text-text-muted truncate">{art.track_count} Tracks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison results */}
      {name1 && name2 ? (
        isLoading ? (
          <LoadingSkeleton type="grid" count={2} />
        ) : error ? (
          <ErrorState message="Could not fetch artist comparison details." />
        ) : (
          <div className="space-y-8">
            {/* Header Cards side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Artist 1 Info */}
              <div 
                onClick={() => navigate(`/artist/${encodeURIComponent(comparison.artist1.artist_name)}`)}
                className="glass-card p-5 rounded-xl border border-primary/20 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition duration-200"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
                  <AlbumArtwork title={comparison.artist1.artist_name} sizeClass="w-full h-full" roundedClass="rounded-full" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">Artist A</span>
                  <h3 className="font-bold text-white truncate">{comparison.artist1.artist_name}</h3>
                  <p className="text-xs text-text-muted">{comparison.artist1.track_count} tracks analyzed</p>
                </div>
              </div>

              {/* Artist 2 Info */}
              <div 
                onClick={() => navigate(`/artist/${encodeURIComponent(comparison.artist2.artist_name)}`)}
                className="glass-card p-5 rounded-xl border border-secondary/20 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition duration-200"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
                  <AlbumArtwork title={comparison.artist2.artist_name} sizeClass="w-full h-full" roundedClass="rounded-full" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-secondary tracking-wider font-mono">Artist B</span>
                  <h3 className="font-bold text-white truncate">{comparison.artist2.artist_name}</h3>
                  <p className="text-xs text-text-muted">{comparison.artist2.track_count} tracks analyzed</p>
                </div>
              </div>
            </div>

            {/* Radar Comparison and Attribute Table splits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar comparison chart */}
              <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center h-[350px]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
                  Dual average Signature
                </h4>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                      <PolarGrid stroke="#2a2a2a" />
                      <PolarAngleAxis tick={{ fill: '#b3b3b3', fontSize: 9 }} dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 1.0]} stroke="#2a2a2a" tick={{ fill: '#b3b3b3', fontSize: 8 }} />
                      <Radar
                        name={comparison.artist1.artist_name}
                        dataKey={comparison.artist1.artist_name}
                        stroke="#1db954"
                        fill="#1db954"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name={comparison.artist2.artist_name}
                        dataKey={comparison.artist2.artist_name}
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
                  <User size={14} className="text-secondary" />
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
          title="Select two artists" 
          message="Use the search inputs above to select two artists from the dataset to compare their average audio fingerprints."
          iconType="compass"
        />
      )}
    </div>
  );
};

export default ArtistComparison;
