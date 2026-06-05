import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Music, 
  Grid, 
  Compass, 
  Sliders, 
  BarChart2, 
  LineChart, 
  Info,
  Layers,
  Heart
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { type: 'header', label: 'Core' },
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/bookmarks', label: 'Saved Insights', icon: Heart },
    
    { type: 'header', label: 'Discovery & Explore' },
    { path: '/explore/clusters', label: 'Cluster Explorer', icon: Grid },
    { path: '/explore/genres', label: 'Genre Explorer', icon: Compass },
    { path: '/explore/mood', label: 'Mood Discovery', icon: Sliders },
    { path: '/explore/playlists', label: 'Playlist Insights', icon: Layers },
    
    { type: 'header', label: 'Data Analytics' },
    { path: '/analytics', label: 'Overview', icon: BarChart2 },
    { path: '/analytics/clusters', label: 'Cluster Analytics', icon: ActivityIcon }, // custom activity/scatter icon
    { path: '/analytics/correlations', label: 'Correlation Matrix', icon: LineChart },
    
    { type: 'header', label: 'System' },
    { path: '/about-model', label: 'About ML Model', icon: Info }
  ];

  function ActivityIcon(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  }

  return (
    <aside className="w-64 bg-black h-screen sticky top-0 flex flex-col border-r border-border select-none overflow-y-auto">
      {/* Brand logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-black font-extrabold text-xl shadow-[0_0_15px_rgba(29,185,84,0.4)]">
          IQ
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-white flex items-center gap-1">
            Spotify<span className="text-primary font-black">IQ</span>
          </h1>
          <span className="text-xs text-text-muted font-mono tracking-tight">Sonic Intelligence v1</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div 
                key={`header-${index}`} 
                className="text-[10px] uppercase font-bold tracking-widest text-text-muted/60 pl-3 pt-6 pb-2"
              >
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-black font-semibold shadow-[0_4px_12px_rgba(29,185,84,0.15)]' 
                    : 'text-text-muted hover:text-white hover:bg-surface/50'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Context info */}
      <div className="p-4 border-t border-border bg-surface-lowest/50 text-[10px] text-text-muted font-mono text-center">
        Powered by KMeans & Cosine Similarity
      </div>
    </aside>
  );
};

export default Sidebar;
