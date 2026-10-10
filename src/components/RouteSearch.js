'use client';

import React, { useState } from 'react';

export default function RouteSearch({
  onCalculateRoute,
  routesList = [],
  selectedRouteIndex,
  onSelectRouteIndex,
  onClearRoute,
  onSimulateDrive,
  isSimulating,
}) {
  const [origin, setOrigin] = useState('coer university');
  const [destination, setDestination] = useState("COER Flag ground VXR5+MP8, Rehmadpur, Belara, Uttarakhand 247667, India")

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination) return;
    onCalculateRoute(origin, destination);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-4 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 font-semibold mb-1 block">Origin Address</label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. isbt, dehradun"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 font-semibold mb-1 block">Destination Address</label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. uttaranchal university,Dehradun"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors flex-1 md:flex-initial"
          >
            Compare Routes
          </button>
          {routesList.length > 0 && (
            <>
              <button
                type="button"
                onClick={onSimulateDrive}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  isSimulating
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulating ? 'Driving...' : 'Simulate HUD Drive'}
              </button>
              <button
                type="button"
                onClick={onClearRoute}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </form>

     
      {routesList.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            Select Routing Mode:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {routesList.map((item, idx) => {
              const isSelected = selectedRouteIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectRouteIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? item.isSafest
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-indigo-500 bg-indigo-950/20'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-100">
                      {item.summary || `Route ${idx + 1}`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isSafest
                          ? 'bg-emerald-600 text-emerald-100'
                          : 'bg-amber-600 text-amber-100'
                      }`}
                    >
                      {item.isSafest ? '🛡️ Recommended Safest' : '⏱️ Standard / Fastest'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <span>Hazards:</span>{' '}
                      <strong className={item.hazardCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.hazardCount}
                      </strong>
                    </div>
                    <div>
                      <span>Distance:</span> <strong className="text-slate-200">{item.distanceText}</strong>
                    </div>
                    <div>
                      <span>Duration:</span> <strong className="text-slate-200">{item.durationText}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}