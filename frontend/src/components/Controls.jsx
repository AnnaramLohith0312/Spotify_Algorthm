import React from 'react';
import { Search } from 'lucide-react';

export const FilterChip = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-xs font-semibold transition duration-200 cursor-pointer ${
        isActive 
          ? 'bg-primary text-black border-primary shadow-[0_4px_12px_rgba(29,185,84,0.15)] font-bold' 
          : 'bg-surface-elevated hover:bg-surface border-border text-white hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
};

export const DropdownFilter = ({ label, value, options, onChange }) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-text-muted block">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary capitalize font-medium cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const SliderFilter = ({ label, value, min = 0, max = 1, step = 0.05, unit = '%', onChange }) => {
  const displayVal = unit === '%' ? `${Math.round(value * 100)}%` : `${value}${unit}`;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="font-semibold text-white">{label}</span>
        <span className="text-primary font-bold">{displayVal}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
};

export const SearchBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Search...", 
  variant = "compact", 
  buttonText = "Search" 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative flex items-center bg-black/60 border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 rounded-full p-1.5 transition duration-300">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent px-5 py-2.5 text-sm md:text-base text-white placeholder-text-muted/50 focus:outline-none"
          />
          <button 
            type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary-dim text-black rounded-full font-bold text-sm md:text-base flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition duration-200 cursor-pointer"
          >
            <Search size={16} />
            <span>{buttonText}</span>
          </button>
        </div>
      </form>
    );
  }

  // Default 'compact' variant
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-full bg-surface-elevated border border-border text-xs text-white placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition duration-300"
        />
        <Search size={14} className="absolute left-3 top-2.5 text-text-muted/60" />
      </div>
    </form>
  );
};

