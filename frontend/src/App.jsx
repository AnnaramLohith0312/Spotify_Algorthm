import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MobileNav from './components/MobileNav';

// Import Pages
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import SavedBookmarks from './pages/SavedBookmarks';
import SongRecommendations from './pages/SongRecommendations';
import ArtistRecommendations from './pages/ArtistRecommendations';
import SongDetails from './pages/SongDetails';
import ArtistDetails from './pages/ArtistDetails';
import ClusterExplorer from './pages/ClusterExplorer';
import GenreExplorer from './pages/GenreExplorer';
import MoodDiscovery from './pages/MoodDiscovery';
import PlaylistInsights from './pages/PlaylistInsights';
import AnalyticsOverview from './pages/AnalyticsOverview';
import ClusterAnalytics from './pages/ClusterAnalytics';
import CorrelationInsights from './pages/CorrelationInsights';
import AboutModel from './pages/AboutModel';
import SongComparison from './pages/SongComparison';
import ArtistComparison from './pages/ArtistComparison';

// Create React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar - desktop only */}
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>

          {/* Main workspace */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Header Area */}
            <TopBar />

            {/* Scrollable Viewport */}
            <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-16">
              <div className="max-w-[1400px] mx-auto space-y-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/bookmarks" element={<SavedBookmarks />} />
                  <Route path="/recommend/song/:id" element={<SongRecommendations />} />
                  <Route path="/recommend/artist/:name" element={<ArtistRecommendations />} />
                  <Route path="/song/:id" element={<SongDetails />} />
                  <Route path="/artist/:name" element={<ArtistDetails />} />
                  
                  {/* Parameterized deep links */}
                  <Route path="/explore/clusters" element={<ClusterExplorer />} />
                  <Route path="/explore/clusters/:id" element={<ClusterExplorer />} />
                  <Route path="/explore/genres" element={<GenreExplorer />} />
                  <Route path="/explore/genres/:name" element={<GenreExplorer />} />
                  
                  <Route path="/explore/mood" element={<MoodDiscovery />} />
                  <Route path="/explore/playlists" element={<PlaylistInsights />} />
                  
                  <Route path="/compare/songs" element={<SongComparison />} />
                  <Route path="/compare/artists" element={<ArtistComparison />} />
                  
                  <Route path="/analytics" element={<AnalyticsOverview />} />
                  <Route path="/analytics/clusters" element={<ClusterAnalytics />} />
                  <Route path="/analytics/correlations" element={<CorrelationInsights />} />
                  
                  <Route path="/about-model" element={<AboutModel />} />
                  
                  {/* Catch all fallback */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* Mobile bottom bar navigation */}
          <MobileNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
