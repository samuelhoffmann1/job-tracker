import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading job data...' }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6 font-mono">
      <div className="animate-pulse">$ {message}</div>
      <div className="animate-pulse mt-2">$ Please wait...</div>
      <div className="animate-pulse mt-2 inline-block">_</div>
    </div>
  );
};

export default LoadingState;