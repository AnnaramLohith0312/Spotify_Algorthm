import React from 'react';
import { useModelEvaluation } from '../hooks/useSpotifyApi';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { Code, Award, HelpCircle, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

const AboutModel = () => {
  const { data: evalData, isLoading, error } = useModelEvaluation();

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={2} />;
  }

  if (error) {
    return <ErrorState message="Could not fetch model evaluation metrics." />;
  }

  const { metrics, metrics_summary } = evalData;

  return (
    <div className="space-y-8 select-none leading-relaxed text-text-muted">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="About SpotifyIQ Machine Learning"
        subtitle="Walkthrough of the data cleaning pipeline, clustering model, and similarity recommendation math"
        icon={Cpu}
      />

      {/* Evaluation Charts Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plot 1: Elbow Method (Inertia vs k) */}
        <div className="glass-card p-5 rounded-2xl flex flex-col h-[320px]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary" />
            <span>Elbow Method (Inertia vs K)</span>
          </h4>
          <p className="text-[10px] text-text-muted mb-4">
            Shows overall cluster spread. We seek the "elbow" point where distortion drop slows down (chosen k=6).
          </p>
          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={metrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="k" stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 9 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#2a2a2a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="inertia" name="Inertia" stroke="#1db954" strokeWidth={2} dot={{ fill: '#1db954', r: 3 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Silhouette Score vs k */}
        <div className="glass-card p-5 rounded-2xl flex flex-col h-[320px]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <TrendingUp size={14} className="text-secondary" />
            <span>Silhouette Analysis vs K</span>
          </h4>
          <p className="text-[10px] text-text-muted mb-4">
            Measures cluster separation (higher is better). K=6 yields optimal balance of separation and genre coverage.
          </p>
          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={metrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="k" stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 10 }} />
                <YAxis stroke="#555" tick={{ fill: '#b3b3b3', fontSize: 9 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#2a2a2a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="silhouette" name="Silhouette Score" stroke="#4a90d9" strokeWidth={2} dot={{ fill: '#4a90d9', r: 3 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline breakdown card (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Data Cleaning & Preprocessing */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Code size={18} className="text-primary" />
              <span>1. Data Cleaning & Feature Scaling</span>
            </h3>
            <p className="text-xs">
              Raw Spotify data contains duplicate track IDs and missing values (e.g. empty track names or artist fields) that skew analytical results.
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1.5 pt-1">
              <li><strong>Duplicate Removal:</strong> Deduplicated the track table on <code className="font-mono text-white">track_id</code>, keeping the first occurrence.</li>
              <li><strong>Null Removal:</strong> Dropped rows missing <code className="font-mono text-white">track_name</code>, <code className="font-mono text-white">track_artist</code>, or <code className="font-mono text-white">track_album_name</code>.</li>
              <li><strong>Standardization:</strong> Numeric audio features have different scales (e.g. tempo is typically 60–200 BPM, loudness is -60 to 0 dB, while energy is 0.0–1.0). We run <code className="font-mono text-white">StandardScaler</code> to center them around a mean of 0 with unit variance:</li>
            </ul>
            <div className="p-3 bg-black/40 border border-border/60 rounded font-mono text-[10px] text-white/90">
              z = (x - u) / s
            </div>
          </div>

          {/* Card 2: K-Means Clustering */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award size={18} className="text-primary" />
              <span>2. K-Means Cluster Modeling</span>
            </h3>
            <p className="text-xs">
              We trained a K-Means model with <strong className="text-white">k=6 clusters</strong> on the scaled audio vectors.
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1.5 pt-1">
              <li><strong>Why k=6?</strong> The Elbow Method (Inertia) and Silhouette Analysis identified that while k=2 had high silhouette scores, <strong>k=6 clusters</strong> yielded optimal interpretability and naturally aligned with the 6 parent playlist genres in the dataset.</li>
              <li><strong>Clusters Labeling:</strong> The clusters correspond to mathematically grouped sonic styles, which we named: Acoustic & Mellow, Danceable Pop/Latin, High-Energy Electronic, Upbeat R&B/Funk, Intense EDM, and Dark Energetic.</li>
            </ul>
          </div>

          {/* Card 3: Cosine Similarity and Popularity Weighting */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <span>3. Hybrid Recommendation Formula</span>
            </h3>
            <p className="text-xs">
              To recommend tracks, we utilize a hybrid ranking algorithm combining content-based vector similarity and track popularity.
            </p>
            <p className="text-xs">
              First, the algorithm locates the query song's cluster, limiting candidate songs to the <strong>same cluster</strong>. This enforces overall acoustic style boundaries. Then, it computes the Cosine Similarity between the query vector and candidate vectors:
            </p>
            <div className="p-3 bg-black/40 border border-border/60 rounded font-mono text-[10px] text-white/90">
              Cosine Similarity (A, B) = (A &bull; B) / (||A|| * ||B||)
            </div>
            <p className="text-xs">
              To avoid recommending obscure tracks, we normalize the popularity score of the candidates and calculate a weighted final rank:
            </p>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded font-mono text-[10px] text-primary font-bold">
              Final Score = 0.85 * Similarity + 0.15 * Popularity_Norm
            </div>
          </div>
        </div>

        {/* Limitations & Stats Sidebar (takes 1 col) */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-border/40 pb-2">
              <AlertTriangle size={14} className="text-accent-gold" />
              <span>Limitations & Scope</span>
            </h3>
            <div className="text-xs space-y-3 leading-relaxed">
              <p>
                <strong>Content-Only Constraints:</strong> Recommendations are calculated purely from acoustic metadata. The model does not know about user listening histories, song release timelines, lyrics, or social tagging.
              </p>
              <p>
                <strong>Dataset Bound:</strong> Recommendations can only return songs that are present in our local 28,352 track dataset. It does not interface dynamically with Spotify's live global catalog.
              </p>
              <p>
                <strong>Acoustic Cluster Limitations:</strong> Songs from different genres can end up in the same cluster if their production attributes match (e.g. an energetic rock track and an energetic EDM track might both fall into Cluster 2). This is mathematically correct but may surprise users expecting strict genre separations.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider text-[10px]">Model Evaluation Metrics</h4>
            <div className="space-y-1.5 pt-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted/60">Silhouette Score:</span>
                <span className="text-white font-bold">{metrics_summary.silhouette_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/60">Davies-Bouldin Index:</span>
                <span className="text-white font-bold">{metrics_summary.davies_bouldin_index}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted/60">Calinski-Harabasz:</span>
                <span className="text-white font-bold">{metrics_summary.calinski_harabasz_score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModel;
