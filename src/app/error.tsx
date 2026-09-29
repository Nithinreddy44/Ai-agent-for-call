'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
      <h2 className="text-lg font-bold text-white">Something went wrong!</h2>
      <p className="text-xs text-slate-400 font-mono">{error.message || 'An error occurred loading this view.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
      >
        Try again
      </button>
    </div>
  );
}
