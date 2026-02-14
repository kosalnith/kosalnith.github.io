
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse mt-8">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-800 rounded"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
      </div>
      <div className="h-48 bg-gray-800 rounded-2xl"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-gray-800 rounded-xl"></div>
        <div className="h-12 bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
