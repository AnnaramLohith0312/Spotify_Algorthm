import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Columns, 
  Menu 
} from 'lucide-react';
import { SearchBar } from './Controls';
import { MobileNavigationDrawer } from './MobileNav';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync search input with URL search parameter if we are on the /search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setSearchVal(params.get('q') || '');
    } else {
      setSearchVal('');
    }
  }, [location]);

  // Close drawer on path changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <>
      <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile Hamburger menu */}
        <button 
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2 text-text-muted hover:text-white transition duration-200 cursor-pointer"
          title="Open menu"
          id="mobile-drawer-toggle"
        >
          <Menu size={20} />
        </button>

        {/* Navigation history controls - hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-white transition duration-200 border border-border/50 cursor-pointer"
            title="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => navigate(1)} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-white transition duration-200 border border-border/50 cursor-pointer"
            title="Go forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Global search bar */}
        <div className="flex-1 max-w-sm sm:max-w-md">
          <SearchBar 
            value={searchVal}
            onChange={setSearchVal}
            onSubmit={handleSearchSubmit}
            placeholder="Search database..."
            variant="compact"
          />
        </div>

        {/* Quick shortcuts */}
        <div className="flex items-center gap-2">
          {/* Compare shortcut */}
          <button 
            onClick={() => navigate('/compare/songs')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-elevated border border-border text-[10px] font-semibold text-white hover:text-secondary hover:border-secondary/40 transition duration-200 shrink-0 cursor-pointer"
            title="Compare Songs/Artists"
          >
            <Columns size={12} className="text-secondary" />
            <span className="hidden md:inline">Compare</span>
          </button>

          {/* Saved bookmarks shortcut */}
          <button 
            onClick={() => navigate('/bookmarks')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-elevated border border-border text-[10px] font-semibold text-white hover:text-primary hover:border-primary/40 transition duration-200 shrink-0 cursor-pointer"
            title="My Saved recommendations"
          >
            <Heart size={12} className="text-red-500 fill-red-500" />
            <span className="hidden md:inline">Saved</span>
          </button>
          
          <div className="hidden xs:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-black font-bold text-xs select-none">
              IQ
            </div>
          </div>
        </div>
      </header>

      {/* Reusable Mobile Navigation Drawer */}
      <MobileNavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default TopBar;
