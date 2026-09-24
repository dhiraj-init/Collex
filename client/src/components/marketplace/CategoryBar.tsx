import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Laptop, 
  Bike, 
  Calculator, 
  FlaskConical, 
  Coffee, 
  Armchair, 
  Shirt, 
  Trophy, 
  Gift 
} from 'lucide-react';
import { MOCK_CATEGORIES } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  Laptop,
  Bike,
  Calculator,
  FlaskConical,
  Coffee,
  Armchair,
  Shirt,
  Trophy,
  Gift,
};

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory } = useMarketplace();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -my-2">
      <div className="flex items-center space-x-2 min-w-max px-0.5">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all select-none border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950 font-semibold'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
