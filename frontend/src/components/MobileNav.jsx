import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Grid, 
  BarChart2, 
  X, 
  Sliders, 
  Layers, 
  Compass, 
  Columns, 
  Heart, 
  Info 
} from 'lucide-react';

const MobileNav = () => {
  const items = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/explore/clusters', label: 'Explore', icon: Grid },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 }
  ];

  return (
    <div className="md:hidden h-16 bg-surface/95 backdrop-blur-md border-t border-border w-full fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 select-none">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition duration-200 ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export const MobileNavigationDrawer = ({ isOpen, onClose }) => {
  const items = [
    { type: 'header', label: 'Discovery' },
    { path: '/explore/mood', label: 'Mood Discovery', icon: Sliders },
    { path: '/explore/playlists', label: 'Playlist Insights', icon: Layers },
    { path: '/explore/genres', label: 'Genre Explorer', icon: Compass },
    { path: '/explore/clusters', label: 'Cluster Explorer', icon: Grid },
    
    { type: 'header', label: 'Comparison' },
    { path: '/compare/songs', label: 'Song Comparison', icon: Columns },
    { path: '/compare/artists', label: 'Artist Comparison', icon: Columns },
    
    { type: 'header', label: 'Analytics & System' },
    { path: '/analytics', label: 'Overview Analytics', icon: BarChart2 },
    { path: '/bookmarks', label: 'Saved Insights', icon: Heart },
    { path: '/about-model', label: 'About ML Model', icon: Info }
  ];

  return (
    <>
      {/* Slide-out mobile drawer menu overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out mobile drawer menu container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-border p-6 flex flex-col z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside drawer */}
        <div className="flex items-center justify-between pb-6 border-b border-border/40 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-extrabold text-lg">
              IQ
            </div>
            <h1 className="font-bold text-base text-white">
              Spotify<span className="text-primary font-black">IQ</span>
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-white rounded-lg bg-surface-elevated border border-border transition duration-200 cursor-pointer"
            title="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation links list */}
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
          {items.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div 
                  key={`drawer-header-${index}`} 
                  className="text-[9px] uppercase font-bold tracking-widest text-text-muted/50 pl-3 pt-4 pb-1.5"
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
                onClick={onClose}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-black shadow-[0_4px_12px_rgba(29,185,84,0.15)]' 
                      : 'text-text-muted hover:text-white hover:bg-surface/50'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer inside drawer */}
        <div className="pt-4 border-t border-border/40 text-[9px] text-text-muted font-mono text-center">
          Sonic Intelligence v1.0
        </div>
      </aside>
    </>
  );
};

export default MobileNav;
