'use client';

import React from 'react';

export default function DriverAlertHUD({ activeAlert, onDismiss }) {
  if (!activeAlert) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl animate-bounce">
      <div className="bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600/30 flex items-center justify-center text-rose-300 text-2xl font-black shrink-0 animate-pulse">
            ⚠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                Proximity Warning
              </span>
              <span className="text-xs text-rose-300 font-semibold">
                ~{activeAlert.distanceMeters}m Ahead
              </span>
            </div>
            <p className="text-sm font-semibold text-rose-100 mt-1">
              {activeAlert.message}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white px-3 py-1 bg-rose-900/40 rounded-lg text-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}