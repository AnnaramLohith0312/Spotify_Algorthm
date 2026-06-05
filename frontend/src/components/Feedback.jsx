import React from 'react';
import { Search, AlertTriangle, Inbox, Compass } from 'lucide-react';

export const LoadingSkeleton = ({ type = 'grid', count = 8 }) => {
  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-lg bg-surface shimmer flex items-center px-4 gap-4">
            <div className="w-10 h-10 rounded bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-white/5" />
              <div className="h-3 w-1/6 rounded bg-white/5" />
            </div>
            <div className="w-12 h-6 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  // Default: Card grid skeleton
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl flex flex-col gap-3">
          <div className="aspect-square w-full rounded-lg bg-white/5 shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-white/5 shimmer" />
            <div className="h-3 w-1/2 rounded bg-white/5 shimmer" />
          </div>
          <div className="flex justify-between items-center mt-2 border-t border-border/20 pt-2.5">
            <div className="h-4 w-8 rounded bg-white/5 shimmer" />
            <div className="h-4 w-12 rounded bg-white/5 shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({ 
  title = 'No results found', 
  message = 'Try adjusting your search terms or filters.', 
  iconType = 'search',
  actionButton 
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'warning':
        return <AlertTriangle size={40} className="text-accent-gold" />;
      case 'compass':
        return <Compass size={40} className="text-secondary" />;
      case 'inbox':
        return <Inbox size={40} className="text-text-muted" />;
      default:
        return <Search size={40} className="text-primary" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-5 shadow-lg">
        {getIcon()}
      </div>
      <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed mb-6">{message}</p>
      {actionButton}
    </div>
  );
};

export const ErrorState = ({ message, onRetry }) => {
  return (
    <EmptyState
      title="An error occurred"
      message={message || "Something went wrong while fetching data from the API."}
      iconType="warning"
      actionButton={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dim text-black font-semibold text-sm transition shadow-lg hover:scale-105 duration-200"
          >
            Retry Connection
          </button>
        )
      }
    />
  );
};

export const ClusterBadge = ({ id }) => {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
      C{id}
    </span>
  );
};

export const GenreTag = ({ name }) => {
  return (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20 capitalize">
      {name}
    </span>
  );
};

export const PopularityBadge = ({ score }) => {
  return (
    <span className="text-[10px] font-mono font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded border border-accent-gold/20 flex items-center gap-1 w-fit">
      <span>★</span>
      <span>{score}</span>
    </span>
  );
};

export const SimilarityBadge = ({ score }) => {
  return (
    <span className="text-[9px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
      {Math.round(score * 100)}% Sim
    </span>
  );
};

export const PageHeader = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="text-primary shrink-0" size={24} />)}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-text-muted font-mono leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

export const ErrorStatePanel = ErrorState;

