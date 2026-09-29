'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white p-8 flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-md">
          <h2 className="text-lg font-bold">Global Application Error</h2>
          <p className="text-xs text-slate-400 font-mono">{error?.message || 'Application encountered an error.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
