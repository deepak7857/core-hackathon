export default function RecentAlerts({ anomalies = [], onSelect, selectedId }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col h-full max-h-[650px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live Incident Feed</h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
          ● Live Stream
        </span>
      </div>

      <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
        {anomalies.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-10">
            No incidents detected yet. Waiting for vehicle telemetry...
          </div>
        ) : (
          anomalies.slice(0, 15).map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelect && onSelect(item)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-950/30' 
                    : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">
                    {item.waterPresent ? '🌊 Submerged Pothole' : '⚠️ Road Anomaly'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'HIGH'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-900'
                        : item.severity === 'MEDIUM'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-900'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-y-1">
                  <div>Depth: <span className="text-slate-200 font-medium">{item.depthCm} cm</span></div>
                  <div>Impact: <span className="text-slate-200 font-medium">{item.zPeakG} g</span></div>
                  <div>Speed: <span className="text-slate-200 font-medium">{item.speedKmh} km/h</span></div>
                  <div>Device: <span className="text-slate-200 font-medium">{item.deviceId}</span></div>
                </div>

                <div className="text-[10px] text-slate-500 mt-2 text-right">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}