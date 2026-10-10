'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GoogleMapView from '@/components/map/GoogleMapView';
import StatsBar from '@/components/dashboard/StatsBar';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import RouteSearch from '@/components/RouteSearch';
import DriverAlertHUD from '@/components/dashboard/DriverAlertHUD';
import { isPointNearRoute, getDistanceMeters } from '@/lib/geoUtils';
import { speakAlert, playBeepTone } from '@/lib/audioAlert';

export default function Dashboard() {
  const [anomalies, setAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [filterWaterOnly, setFilterWaterOnly] = useState(false);

  const [directionsResult, setDirectionsResult] = useState(null);
  const [parsedRoutes, setParsedRoutes] = useState([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const [activeAlert, setActiveAlert] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const simTimerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/anomalies');
      if (res.ok) {
        const data = await res.json();
        setAnomalies(data);
      }
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, [fetchData]);
  const handleCalculateRoute = (origin, destination) => {
    if (!window.google || !window.google.maps) {
      alert('Google Maps is still loading. Please retry.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResult(result);

          const openAnomalies = anomalies.filter((a) => a.status !== 'REPAIRED');
          const routesAnalyzed = result.routes.map((rt, idx) => {
            const path = rt.overview_path;
            const onRoute = openAnomalies.filter((a) => isPointNearRoute(a, path, 30));
            const penaltyScore = onRoute.reduce((acc, curr) => acc + (curr.depthCm || 2), 0);

            return {
              index: idx,
              summary: rt.summary || `Route ${idx + 1}`,
              distanceText: rt.legs[0].distance.text,
              durationText: rt.legs[0].duration.text,
              hazardCount: onRoute.length,
              penaltyScore,
              hazards: onRoute,
              isSafest: false,
            };
          });
          let safestIdx = 0;
          let minPenalty = Infinity;
          routesAnalyzed.forEach((r, i) => {
            if (r.penaltyScore < minPenalty) {
              minPenalty = r.penaltyScore;
              safestIdx = i;
            }
          });
          routesAnalyzed[safestIdx].isSafest = true;

          setParsedRoutes(routesAnalyzed);
          setSelectedRouteIdx(safestIdx); 
        } else {
          alert(`Route query failed: ${status}`);
        }
      }
    );
  };

  const handleClearRoute = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setIsSimulating(false);
    setDirectionsResult(null);
    setParsedRoutes([]);
    setSelectedRouteIdx(0);
    setActiveAlert(null);
  };
  const handleSimulateDrive = () => {
    if (!directionsResult || !parsedRoutes[selectedRouteIdx]) return;
    if (isSimulating) {
      clearInterval(simTimerRef.current);
      setIsSimulating(false);
      setActiveAlert(null);
      return;
    }

    setIsSimulating(true);
    const activeRoute = directionsResult.routes[selectedRouteIdx];
    const path = activeRoute.overview_path;
    const hazardsOnRoute = parsedRoutes[selectedRouteIdx].hazards;

    let step = 0;
    const alertedSet = new Set();

    simTimerRef.current = setInterval(() => {
      if (step >= path.length) {
        clearInterval(simTimerRef.current);
        setIsSimulating(false);
        setActiveAlert(null);
        speakAlert('Destination reached safely.');
        return;
      }

      const carPos = { lat: path[step].lat(), lng: path[step].lng() };
      for (const h of hazardsOnRoute) {
        if (!alertedSet.has(h.id)) {
          const dist = Math.round(getDistanceMeters(carPos.lat, carPos.lng, h.lat, h.lng));
          if (dist <= 70) {
            alertedSet.add(h.id);
            playBeepTone();
            const warningMsg = h.waterPresent
              ? `Caution: Water-submerged road hazard in ${dist} meters.`
              : `Caution: Road cavity of depth ${h.depthCm} centimeters in ${dist} meters.`;

            setActiveAlert({
              distanceMeters: dist,
              message: warningMsg,
            });
            speakAlert(warningMsg);
            break;
          }
        }
      }

      step += 2;
    }, 600);
  };

  const displayedAnomalies = filterWaterOnly
    ? anomalies.filter((a) => a.waterPresent)
    : anomalies;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6 relative">
      <DriverAlertHUD
        activeAlert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-white">
             <h2> ARIS</h2> <h3>Advanced Road Inspection System</h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded-full">
              PostgreSQL Connected
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            ADAS Real-Time Proximity Alerting & Safest-Path Navigation Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterWaterOnly(!filterWaterOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterWaterOnly
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {filterWaterOnly ? '✓ Filtering: Water Only' : 'Filter: Water Hazards'}
          </button>
        </div>
      </header>

      <StatsBar anomalies={anomalies} />

      <RouteSearch
        onCalculateRoute={handleCalculateRoute}
        routesList={parsedRoutes}
        selectedRouteIndex={selectedRouteIdx}
        onSelectRouteIndex={(idx) => setSelectedRouteIdx(idx)}
        onClearRoute={handleClearRoute}
        onSimulateDrive={handleSimulateDrive}
        isSimulating={isSimulating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        <div className="lg:col-span-1 h-[650px]">
          <RecentAlerts
            anomalies={displayedAnomalies}
            selectedId={selectedAnomaly?.id}
            onSelect={(item) => setSelectedAnomaly(item)}
          />
        </div>

        <div className="lg:col-span-3 h-[650px]">
          <GoogleMapView
            anomalies={displayedAnomalies}
            selectedAnomaly={selectedAnomaly}
            onSelectAnomaly={(item) => setSelectedAnomaly(item)}
            directionsResponse={directionsResult}
            routeIndex={selectedRouteIdx}
          />
        </div>
      </div>
    </main>
  );
}