export default function StatsBar({ anomalies = [] }) {
  const total = anomalies.length;
  const critical = anomalies.filter((a) => a.severity === 'HIGH').length;
  const waterHazards = anomalies.filter((a) => a.waterPresent).length;
  const avgDepth = total > 0 
    ? (anomalies.reduce((sum, a) => sum + (a.depthCm || 0), 0) / total).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Hazards</span>
        <div className="text-2xl font-bold text-amber-400 mt-1">{total}</div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Risk</span>
        <div className="text-2xl font-bold text-rose-500 mt-1">{critical}</div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Water Submerged</span>
        <div className="text-2xl font-bold text-cyan-400 mt-1">{waterHazards}</div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Depth</span>
        <div className="text-2xl font-bold text-indigo-400 mt-1">{avgDepth} <span className="text-sm font-normal text-slate-400">cm</span></div>
      </div>
    </div>
  );
}