import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, BarChart2, Grid, Sliders, Database, Layers } from 'lucide-react';
import { useAnalyticsOverview, useClusters } from '../hooks/useSpotifyApi';
import { ClusterCard, MetricCard, InsightCard } from '../components/Cards';
import { LoadingSkeleton, ErrorState } from '../components/Feedback';
import { SearchBar } from '../components/Controls';

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  const { data: overview, isLoading: statsLoading, error: statsError } = useAnalyticsOverview();
  const { data: clusters, isLoading: clustersLoading, error: clustersError } = useClusters();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const ctaCards = [
    {
      title: "Audio Feature Search",
      description: "Find songs matching exact sliders for danceability, energy, and acousticness.",
      icon: Sliders,
      path: "/explore/mood",
      color: "text-primary"
    },
    {
      title: "K-Means Clusters",
      description: "Explore the 6 mathematical clusters representing different sonic styles.",
      icon: Grid,
      path: "/explore/clusters",
      color: "text-secondary"
    },
    {
      title: "Dataset Dashboards",
      description: "Inspect statistical distributions, feature correlations, and PCA projections.",
      icon: BarChart2,
      path: "/analytics",
      color: "text-accent-gold"
    }
  ];

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <section className="relative rounded-2xl overflow-hidden py-16 px-8 bg-gradient-to-r from-primary/10 via-surface/40 to-secondary/15 border border-border/40 text-center">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Unveil the DNA of <span className="text-primary">Music</span>
        </h2>
        <p className="text-base text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
          An explainable music recommendation and audio analytics platform powered by machine learning, cluster modeling, and content-based similarity.
        </p>

        {/* Hero search */}
        <SearchBar 
          value={query}
          onChange={setQuery}
          onSubmit={handleSearchSubmit}
          placeholder="Search for a song or artist in the database to get recommendations..."
          variant="hero"
          buttonText="Analyze"
        />
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-xl h-24 shimmer" />
          ))
        ) : statsError ? (
          <div className="col-span-4 text-center text-accent-red text-xs py-4">Could not load dataset metrics.</div>
        ) : (
          <>
            <MetricCard 
              title="Total Songs" 
              value={overview.total_tracks.toLocaleString()} 
              icon={Music} 
              color="text-primary" 
            />
            <MetricCard 
              title="Unique Artists" 
              value={overview.total_artists.toLocaleString()} 
              icon={Database} 
              color="text-secondary" 
            />
            <MetricCard 
              title="Playlists" 
              value={overview.total_playlists.toLocaleString()} 
              icon={Layers} 
              color="text-accent-gold" 
            />
            <MetricCard 
              title="ML Clusters" 
              value={overview.total_clusters.toString()} 
              icon={Grid} 
              color="text-purple-400" 
            />
          </>
        )}
      </section>

      {/* Quick Action Navigation Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Quick Exploration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ctaCards.map((card, i) => (
            <InsightCard 
              key={i}
              title={card.title}
              description={card.description}
              icon={card.icon}
              color={card.color}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </section>

      {/* Featured clusters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">Featured Audio Clusters</h3>
          <button 
            onClick={() => navigate('/explore/clusters')} 
            className="text-xs text-primary font-bold hover:underline"
          >
            See All Clusters
          </button>
        </div>
        
        {clustersLoading ? (
          <LoadingSkeleton type="grid" count={6} />
        ) : clustersError ? (
          <ErrorState message="Failed to load clusters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clusters.slice(0, 6).map((cluster) => (
              <ClusterCard key={cluster.cluster_id} cluster={cluster} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
