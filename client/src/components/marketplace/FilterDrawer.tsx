import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'] as const;
const DEAL_TYPES = ['Sell', 'Rent', 'Exchange', 'Free'] as const;

export const FilterDrawer: React.FC = () => {
  const { 
    isFilterDrawerOpen, 
    setIsFilterDrawerOpen, 
    selectedConditions, 
    setSelectedConditions,
    selectedDealTypes,
    setSelectedDealTypes,
    priceRange,
    setPriceRange,
    resetFilters,
    activeFiltersCount
  } = useMarketplace();

  if (!isFilterDrawerOpen) return null;

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) => 
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const toggleDealType = (deal: string) => {
    setSelectedDealTypes((prev) => 
      prev.includes(deal) ? prev.filter((d) => d !== deal) : [...prev, deal]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsFilterDrawerOpen(false)}
      />

      {/* Slide-over Content */}
      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-white text-base">Filter Campus Listings</h3>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          
          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px]">Price Range</span>
              <span className="text-emerald-400 font-mono font-medium">₹0 – ₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>₹0 (Free)</span>
              <span>₹5,000</span>
              <span>₹10,000+</span>
            </div>
          </div>

          {/* Deal Type */}
          <div>
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px] block mb-3">
              Listing Deal Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEAL_TYPES.map((deal) => {
                const isSelected = selectedDealTypes.includes(deal);
                return (
                  <button
                    key={deal}
                    type="button"
                    onClick={() => toggleDealType(deal)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-medium'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{deal}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Condition */}
          <div>
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px] block mb-3">
              Condition
            </span>
            <div className="space-y-2">
              {CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <label
                    key={cond}
                    className="flex items-center space-x-2.5 cursor-pointer text-slate-300 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCondition(cond)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                    <span>{cond}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center space-x-3 bg-slate-950/60">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(false)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm transition-colors text-center"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
};
