import React from 'react';

export const ListingSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="aspect-4/3 w-full bg-slate-800/60 relative">
        <div className="absolute bottom-2.5 left-2.5 w-16 h-4 bg-slate-700/60 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-20 h-5 bg-slate-800 rounded"></div>
            <div className="w-12 h-4 bg-slate-800/60 rounded"></div>
          </div>
          <div className="w-full h-4 bg-slate-800 rounded mb-1.5"></div>
          <div className="w-2/3 h-4 bg-slate-800 rounded"></div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="w-32 h-3 bg-slate-800/60 rounded"></div>
          <div className="flex justify-between">
            <div className="w-24 h-3 bg-slate-800/60 rounded"></div>
            <div className="w-12 h-3 bg-slate-800/60 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
