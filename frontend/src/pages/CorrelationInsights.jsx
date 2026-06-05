import React from 'react';
import { useCorrelationMatrix } from '../hooks/useSpotifyApi';
import { CorrelationHeatmap } from '../components/Visuals';
import { LoadingSkeleton, ErrorState, PageHeader } from '../components/Feedback';
import { LineChart, BookOpen, AlertCircle } from 'lucide-react';

const CorrelationInsights = () => {
  const { data: correlationData, isLoading, error } = useCorrelationMatrix();

  if (isLoading) {
    return <LoadingSkeleton type="grid" count={2} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="space-y-8 select-none">
      {/* Reusable PageHeader */}
      <PageHeader 
        title="Acoustic Correlation Insights"
        subtitle="Pearson correlation coefficients indicating how audio features dynamically shift in relation to each other"
        icon={LineChart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Custom Grid Correlation Heatmap (takes 2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Pearson Correlation Matrix Heatmap</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Hover over a coordinate square below to inspect the correlation details. Diagonal cells represent self-correlation (1.00). Green represents positive correlation, and red represents negative correlation.
            </p>
          </div>
          
          <CorrelationHeatmap correlationData={correlationData} />
        </div>

        {/* Right: Analytical Interpretations (takes 1 col) */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-border/40 pb-2">
              <BookOpen size={14} className="text-primary" />
              <span>Key Observations</span>
            </h3>

            <div className="space-y-4 text-xs leading-relaxed text-text-muted">
              <div>
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Strong Positive: Energy & Loudness</span>
                </h4>
                <p className="mt-1">
                  Energy and loudness exhibit the strongest positive correlation (typically ~0.67). As production energy increases, peak sound pressure (loudness in decibels) rises, which is standard in EDM and rock music.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-accent-red uppercase text-[10px] tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent-red rounded-full" />
                  <span>Strong Negative: Acousticness & Energy</span>
                </h4>
                <p className="mt-1">
                  Acousticness and energy have a strong negative correlation (typically ~ -0.53). Songs with high acoustic resonance (piano, acoustic guitar) consistently lack the loud, compressed synthesizer tracks that drive modern high-energy genres.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Positives: Valence & Danceability</span>
                </h4>
                <p className="mt-1">
                  Valence (musical happiness) and danceability correlate positively. Cheerful, higher-valence tracks are structurally composed with strong syncopated rhythms that encourage body movement.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-elevated rounded-lg border border-border/60 text-[10px] text-text-muted flex items-start gap-2.5">
            <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Scale Notes:</strong> Values near +1.0 indicate strong positive links, values near -1.0 indicate strong negative relationships, and values near 0.0 indicate no linear relationship.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationInsights;
